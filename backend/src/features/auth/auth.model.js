// src/features/auth/auth.model.js
const pool = require("../../config/db");

// ✅ Find user by username
async function findUserByUsername(username) {
  const [rows] = await pool.query(
    `SELECT 
        u.userId, 
        u.username, 
        u.email, 
        u.password, 
        u.roleId, 
        u.firstName, 
        u.lastName, 
        u.contactNumber, 
        u.address, 
        u.isBlocked,
        c.customerId
     FROM users u
     LEFT JOIN customers c ON c.userId = u.userId
     WHERE u.username = ?`,
    [username]
  );
  return rows[0];
}



// async function findUserByUsername(username) {
//   const [rows] = await pool.query(
//     "SELECT * FROM users WHERE username = ?",
//     [username]
//   );
//   return rows[0]; // single user or undefined
// }

// ✅ Find user by email
async function findUserByEmail(email) {
  const [rows] = await pool.query(
    "SELECT * FROM users WHERE email = ?",
    [email]
  );
  return rows[0]; // single user or undefined
}

async function createUser(user) {
  const { username, email, password, roleId, firstName, lastName, contactNumber, address } = user;

  const [result] = await pool.query(
    `INSERT INTO users
      (username, email, password, roleId, firstName, lastName, contactNumber, address)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      username,
      email,
      password,
      roleId || 3, // default Customer role
      firstName,
      lastName,
      contactNumber,
      address
    ]
  );
  return result;
}

async function createTechnician(user) {
  const { username, email, password, firstName, lastName, contactNumber, address } = user;

  const [result] = await pool.query(
    `INSERT INTO users
      (username, email, password, roleId, firstName, lastName, contactNumber, address)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      username,
      email,
      password,
      1, // Technician role
      firstName,
      lastName,
      contactNumber,
      address
    ]
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



module.exports = { findUserByUsername, findUserByEmail, createUser, updatePasswordByEmail, createTechnician };
