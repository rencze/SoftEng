const pool = require("../../config/db");

// Get user by ID
async function findUserById(userId) {
  const [rows] = await pool.query("SELECT * FROM users WHERE userId = ?", [userId]);
  return rows[0];
}

// Get all users (admin)
async function getAllUsers() {
  const [rows] = await pool.query("SELECT * FROM users");
  return rows;
}

module.exports = { findUserById, getAllUsers };
