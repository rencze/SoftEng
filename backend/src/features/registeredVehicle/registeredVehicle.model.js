// registeredVehicle.model.js
const pool = require("../../config/db");

// Fetch all registered vehicles with current owner details and ownership order
async function getAllRegisteredVehicles() {
  try {
    const [rows] = await pool.query(`
      SELECT 
        rv.registeredVehicleId,
        v.vehicleId,
        v.plateNumber,
        v.brand,
        v.model,
        v.year,
        c.customerId,
        CONCAT(u.firstName, ' ', u.lastName) AS currentOwner,
        rv.registeredAt,
        rv.updatedAt,
        (
          SELECT COUNT(*) 
          FROM vehicleOwnershipHistory voh2 
          WHERE voh2.vehicleId = v.vehicleId 
          AND voh2.ownershipStart <= (
            SELECT ownershipStart 
            FROM vehicleOwnershipHistory voh3 
            WHERE voh3.vehicleId = v.vehicleId 
            AND voh3.customerId = c.customerId 
            AND voh3.ownershipEnd IS NULL
            LIMIT 1
          )
        ) AS ownerOrder
      FROM registeredVehicle rv
      JOIN vehicle v ON rv.vehicleId = v.vehicleId
      JOIN customers c ON rv.customerId = c.customerId
      JOIN users u ON c.userId = u.userId
      WHERE EXISTS (
        SELECT 1 
        FROM vehicleOwnershipHistory voh 
        WHERE voh.vehicleId = v.vehicleId 
        AND voh.customerId = c.customerId 
        AND voh.ownershipEnd IS NULL
      )
    `);
    
    // Add ownerLabel like "1st Owner", "2nd Owner", etc.
    return rows.map(row => {
      const suffix = getOrdinalSuffix(row.ownerOrder);
      return {
        ...row,
        ownerLabel: `${row.ownerOrder}${suffix} Owner`
      };
    });
  } catch (error) {
    console.error("Error in getAllRegisteredVehicles:", error);
    throw error;
  }
}

// Register or update ownership
async function registerVehicle(vehicleId, customerId) {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Close old ownership in history if exists
    await connection.query(
      `UPDATE vehicleOwnershipHistory 
       SET ownershipEnd = NOW() 
       WHERE vehicleId = ? AND ownershipEnd IS NULL`,
      [vehicleId]
    );

    // Insert/Update registeredVehicle (only one active per vehicle)
    const [rvResult] = await connection.query(`
      INSERT INTO registeredVehicle (vehicleId, customerId)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE 
        customerId = VALUES(customerId),
        updatedAt = CURRENT_TIMESTAMP
    `, [vehicleId, customerId]);

    // Insert into ownership history (new owner)
    await connection.query(`
      INSERT INTO vehicleOwnershipHistory (vehicleId, customerId, ownershipStart)
      VALUES (?, ?, NOW())
    `, [vehicleId, customerId]);

    await connection.commit();
    return rvResult;
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Error in registerVehicle:", error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
}

// Remove registration (vehicle becomes unregistered)
async function removeRegisteredVehicle(vehicleId) {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Close active ownership
    await connection.query(
      `UPDATE vehicleOwnershipHistory 
       SET ownershipEnd = NOW() 
       WHERE vehicleId = ? AND ownershipEnd IS NULL`,
      [vehicleId]
    );

    const [result] = await connection.query(
      `DELETE FROM registeredVehicle WHERE vehicleId = ?`,
      [vehicleId]
    );

    await connection.commit();
    return result;
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Error in removeRegisteredVehicle:", error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
}

// Get ownership history (with "1st owner", "2nd owner" labels)
async function getOwnershipHistory(vehicleId) {
  try {
    const [rows] = await pool.query(`
      SELECT 
        voh.historyId,
        voh.vehicleId,
        v.plateNumber,
        CONCAT(u.firstName, ' ', u.lastName) AS ownerName,
        voh.ownershipStart,
        voh.ownershipEnd,
        ROW_NUMBER() OVER (PARTITION BY voh.vehicleId ORDER BY voh.ownershipStart ASC) AS ownerOrder
      FROM vehicleOwnershipHistory voh
      JOIN customers c ON voh.customerId = c.customerId
      JOIN users u ON c.userId = u.userId
      JOIN vehicle v ON voh.vehicleId = v.vehicleId
      WHERE voh.vehicleId = ?
      ORDER BY voh.ownershipStart ASC
    `, [vehicleId]);

    // Add ownerLabel like "1st Owner", "2nd Owner", etc.
    return rows.map(row => {
      const suffix = getOrdinalSuffix(row.ownerOrder);
      return {
        historyId: row.historyId,
        vehicleId: row.vehicleId,
        plateNumber: row.plateNumber,
        ownerName: row.ownerName,
        ownershipStart: row.ownershipStart,
        ownershipEnd: row.ownershipEnd,
        ownerOrder: row.ownerOrder,
        ownerLabel: `${row.ownerOrder}${suffix} Owner`
      };
    });
  } catch (error) {
    console.error("Error in getOwnershipHistory:", error);
    throw error;
  }
}

// Helper function to add ordinal suffixes (1st, 2nd, 3rd, 4th…)
function getOrdinalSuffix(num) {
  if (typeof num !== 'number') return 'th';
  
  const j = num % 10, k = num % 100;
  if (k >= 11 && k <= 13) return "th";
  if (j === 1) return "st";
  if (j === 2) return "nd";
  if (j === 3) return "rd";
  return "th";
}

module.exports = {
  getAllRegisteredVehicles,
  registerVehicle,
  removeRegisteredVehicle,
  getOwnershipHistory
};