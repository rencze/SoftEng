const pool = require("../../config/db");

// Sync all users with roleId = 3 to customers table
async function syncCustomers() {
  await pool.query(`
    INSERT INTO customers (userId)
    SELECT userId
    FROM users
    WHERE roleId = 3
    ON DUPLICATE KEY UPDATE updatedAt = CURRENT_TIMESTAMP
  `);
}


// Get all customers
async function getAllCustomers() {
  await syncCustomers();

  const [rows] = await pool.query(`
    SELECT 
      c.customerId,
      u.userId,
      u.firstName,
      u.lastName,
      u.email,
      u.contactNumber,
      u.address,
      u.isBlocked = 0 AS active,
      u.roleId,
      r.roleName
    FROM customers c
    JOIN users u ON c.userId = u.userId
    JOIN roles r ON u.roleId = r.roleId
  `);
  return rows;
}

// Add customer manually
async function addCustomer(userId) {
  const [result] = await pool.query(`
    INSERT INTO customers (userId)
    VALUES (?)
    ON DUPLICATE KEY UPDATE updatedAt = CURRENT_TIMESTAMP
  `, [userId]);
  return result;
}

// Remove customer manually
async function removeCustomer(userId) {
  const [result] = await pool.query(`
    DELETE FROM customers WHERE userId = ?
  `, [userId]);
  return result;
}

module.exports = { getAllCustomers, addCustomer, removeCustomer, syncCustomers };
