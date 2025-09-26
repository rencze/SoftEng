const pool = require("../../config/db");

// Sync all users with roleId = 1 to technicians table
async function syncTechnicians() {
  await pool.query(`
    INSERT INTO technicians (userId)
    SELECT userId
    FROM users
    WHERE roleId = 1
    ON DUPLICATE KEY UPDATE updatedAt = CURRENT_TIMESTAMP
  `);
}

// Get all technicians (for display only)

// SELECT 
//       t.technicianId,
//       u.userId,
//       u.firstName,
//       u.lastName,
//       u.email,
//       u.contactNumber,
//       u.address,
//       r.roleName
//     FROM technicians t
//     JOIN users u ON t.userId = u.userId
//     JOIN roles r ON u.roleId = r.roleId

async function getAllTechnicians() {
  await syncTechnicians();

  const [rows] = await pool.query(`
    SELECT 
      t.technicianId,
      u.userId,
      u.firstName,
      u.lastName,
      u.email,
      u.contactNumber,
      u.address,
      u.isBlocked = 0 AS active,  -- map blocked users to active/inactive
      u.roleId,
      r.roleName
    FROM technicians t
    JOIN users u ON t.userId = u.userId
    JOIN roles r ON u.roleId = r.roleId
  `);
  return rows;
}


// Optional: Add technician manually
async function addTechnician(userId) {
  const [result] = await pool.query(`
    INSERT INTO technicians (userId)
    VALUES (?)
    ON DUPLICATE KEY UPDATE updatedAt = CURRENT_TIMESTAMP
  `, [userId]);
  return result;
}

// Optional: Remove technician manually
async function removeTechnician(userId) {
  const [result] = await pool.query(`
    DELETE FROM technicians WHERE userId = ?
  `, [userId]);
  return result;
}

module.exports = { getAllTechnicians, addTechnician, removeTechnician, syncTechnicians };
