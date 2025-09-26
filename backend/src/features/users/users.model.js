  const pool = require("../../config/db");

  // Get user by ID
  async function findUserById(userId, includeRole = false) {
  if (includeRole) {
    const [rows] = await pool.query(
      `SELECT u.*, r.roleName
       FROM users u
       LEFT JOIN roles r ON u.roleId = r.roleId
       WHERE u.userId = ?`,
      [userId]
    );
    return rows[0];
  } else {
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE userId = ?",
      [userId]
    );
    return rows[0];
  }
}

 
  async function getAllUsers() {
    const [rows] = await pool.query(
        `SELECT u.*, r.roleName
    FROM users u
    LEFT JOIN roles r ON u.roleId = r.roleId
    `
    );
    return rows;
  }

  async function updateUser(userId, data) {
  const { firstName, lastName, contactNumber, address, roleId, isBlocked } = data;

  const [result] = await pool.query(
    `UPDATE users 
     SET firstName=?, lastName=?, contactNumber=?, address=?, roleId=?, isBlocked=? 
     WHERE userId=?`,
    [firstName, lastName, contactNumber, address, roleId, isBlocked, userId]
  );

  // 🔄 Sync with technicians table
  if (roleId === 1) {
    // Insert into technicians if not exists
    await pool.query(
      `INSERT INTO technicians (userId)
       VALUES (?)
       ON DUPLICATE KEY UPDATE updatedAt = CURRENT_TIMESTAMP`,
      [userId]
    );
  } else {
    // If role is changed away from Technician → remove or deactivate
    await pool.query(
      `DELETE FROM technicians WHERE userId = ?`,
      [userId]
    );
  }

  return result;
}


  // Delete user
  async function deleteUser(userId) {
    const [result] = await pool.query("DELETE FROM users WHERE userId=?", [userId]);
    return result;
  }

  // ✅ Block/unblock user
async function updateUserBlockStatus(userId, isBlocked) {
  const [result] = await pool.query(
    "UPDATE users SET isBlocked = ? WHERE userId = ?",
    [isBlocked, userId]
  );
  return result;
}

  module.exports = { findUserById, getAllUsers, updateUser, deleteUser, updateUserBlockStatus };
