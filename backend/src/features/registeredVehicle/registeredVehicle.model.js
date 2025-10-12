//registeredVehicle.model.js

const pool = require("../../config/db");

// Fetch all registered vehicles with current owner details
async function getAllRegisteredVehicles() {
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
      rv.updatedAt
    FROM registeredVehicle rv
    JOIN vehicle v ON rv.vehicleId = v.vehicleId
    JOIN customers c ON rv.customerId = c.customerId
    JOIN users u ON c.userId = u.userId
  `);
  return rows;
}

// Register or update ownership
async function registerVehicle(vehicleId, customerId) {
  // Close old ownership in history if exists
  await pool.query(
    `UPDATE vehicleOwnershipHistory 
     SET ownershipEnd = NOW() 
     WHERE vehicleId = ? AND ownershipEnd IS NULL`,
    [vehicleId]
  );

  // Insert/Update registeredVehicle (only one active per vehicle)
  const [rvResult] = await pool.query(`
    INSERT INTO registeredVehicle (vehicleId, customerId)
    VALUES (?, ?)
    ON DUPLICATE KEY UPDATE 
      customerId = VALUES(customerId),
      updatedAt = CURRENT_TIMESTAMP
  `, [vehicleId, customerId]);

  // Insert into ownership history (new owner)
  await pool.query(`
    INSERT INTO vehicleOwnershipHistory (vehicleId, customerId, ownershipStart)
    VALUES (?, ?, NOW())
  `, [vehicleId, customerId]);

  return rvResult;
}

// Remove registration (vehicle becomes unregistered)
async function removeRegisteredVehicle(vehicleId) {
  // Close active ownership
  await pool.query(
    `UPDATE vehicleOwnershipHistory 
     SET ownershipEnd = NOW() 
     WHERE vehicleId = ? AND ownershipEnd IS NULL`,
    [vehicleId]
  );

  const [result] = await pool.query(
    `DELETE FROM registeredVehicle WHERE vehicleId = ?`,
    [vehicleId]
  );

  return result;
}

// Get ownership history (with "1st owner", "2nd owner" labels)
async function getOwnershipHistory(vehicleId) {
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

  // Format with ordinal labels (1st, 2nd, 3rd, etc.)
  return rows.map(row => {
    const suffix = getOrdinalSuffix(row.ownerOrder);
    return {
      ...row,
      ownerLabel: `${row.ownerOrder}${suffix} Owner`
    };
  });
}

// Helper to generate ordinal suffix
function getOrdinalSuffix(num) {
  if (num % 100 >= 11 && num % 100 <= 13) return "th";
  switch (num % 10) {
    case 1: return "st";
    case 2: return "nd";
    case 3: return "rd";
    default: return "th";
  }
}

module.exports = {
  getAllRegisteredVehicles,
  registerVehicle,
  removeRegisteredVehicle,
  getOwnershipHistory
};


// const pool = require("../../config/db");

// // Get all registered vehicles with vehicle + customer details
// async function getAllRegisteredVehicles() {
//   const [rows] = await pool.query(`
//     SELECT 
//       rv.registeredVehicleId,
//       v.vehicleId,
//       v.plateNumber,
//       v.brand,
//       v.model,
//       v.year,
//       c.customerId,
//       u.firstName,
//       u.lastName,
//       rv.registeredAt,
//       rv.updatedAt
//     FROM registeredVehicle rv
//     JOIN vehicle v ON rv.vehicleId = v.vehicleId
//     JOIN customers c ON rv.customerId = c.customerId
//     JOIN users u ON c.userId = u.userId
//   `);
//   return rows;
// }

// // Register or update a vehicle's current owner
// async function registerVehicle(vehicleId, customerId) {
//   // Insert/update registeredVehicle
//   const [rvResult] = await pool.query(`
//     INSERT INTO registeredVehicle (vehicleId, customerId)
//     VALUES (?, ?)
//     ON DUPLICATE KEY UPDATE 
//       customerId = VALUES(customerId),
//       updatedAt = CURRENT_TIMESTAMP
//   `, [vehicleId, customerId]);

//   // Get registeredVehicleId (last inserted or existing)
//   const [rvRow] = await pool.query(
//     `SELECT registeredVehicleId FROM registeredVehicle WHERE vehicleId = ?`,
//     [vehicleId]
//   );
//   const registeredVehicleId = rvRow[0].registeredVehicleId;

//   // Count ownership order for this vehicle
//   const [countRow] = await pool.query(
//     `SELECT COUNT(*) AS cnt FROM registeredCustomer WHERE registeredVehicleId = ?`,
//     [registeredVehicleId]
//   );
//   const ownershipOrder = countRow[0].cnt + 1;

//   // Insert into registeredCustomer (history)
//   await pool.query(`
//     INSERT INTO registeredCustomer (registeredVehicleId, customerId, ownershipOrder)
//     VALUES (?, ?, ?)
//   `, [registeredVehicleId, customerId, ownershipOrder]);

//   return rvResult;
// }

// // Remove vehicle registration
// async function removeRegisteredVehicle(vehicleId) {
//   const [result] = await pool.query(`
//     DELETE FROM registeredVehicle WHERE vehicleId = ?
//   `, [vehicleId]);
//   return result;
// }

// // Get ownership history for a vehicle
// async function getOwnershipHistory(vehicleId) {
//   const [rows] = await pool.query(`
//     SELECT 
//       rc.registeredCustomerId,
//       rc.ownershipOrder,
//       rc.registeredAt,
//       u.firstName,
//       u.lastName,
//       u.email,
//       v.plateNumber,
//       v.brand,
//       v.model,
//       v.year
//     FROM registeredCustomer rc
//     JOIN registeredVehicle rv ON rc.registeredVehicleId = rv.registeredVehicleId
//     JOIN customers c ON rc.customerId = c.customerId
//     JOIN users u ON c.userId = u.userId
//     JOIN vehicle v ON rv.vehicleId = v.vehicleId
//     WHERE rv.vehicleId = ?
//     ORDER BY rc.ownershipOrder ASC
//   `, [vehicleId]);
//   return rows;
// }

// module.exports = { 
//   getAllRegisteredVehicles, 
//   registerVehicle, 
//   removeRegisteredVehicle, 
//   getOwnershipHistory 
// };
