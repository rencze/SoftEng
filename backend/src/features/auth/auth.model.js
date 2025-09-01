// src/features/auth/auth.model.js
const pool = require("../../config/db");

// ✅ Find user by username
async function findUserByUsername(username) {
  const [rows] = await pool.query(
    "SELECT * FROM users WHERE username = ?",
    [username]
  );
  return rows[0]; // single user or undefined
}

// ✅ Find user by email
async function findUserByEmail(email) {
  const [rows] = await pool.query(
    "SELECT * FROM users WHERE email = ?",
    [email]
  );
  return rows[0]; // single user or undefined
}

// ✅ Create a new user
async function createUser(user) {
  const { username, email, password, roleId } = user;
  const [result] = await pool.query(
    "INSERT INTO users (username, email, password, roleId) VALUES (?, ?, ?, ?)",
    [username, email, password, roleId || 3] // default roleId = 3 (Customer)
  );
  return result;
}

// ✅ Update password (forgot password / reset password)
async function updatePasswordByEmail(email, newPassword) {
  const [result] = await pool.query(
    "UPDATE users SET password = ? WHERE email = ?",
    [newPassword, email]
  );
  return result.affectedRows > 0; // true if updated
}

module.exports = { findUserByUsername, findUserByEmail, createUser, updatePasswordByEmail };
