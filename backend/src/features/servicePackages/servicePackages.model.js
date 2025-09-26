const pool = require("../../config/db");

// Get all packages
async function getAllPackagesModel() {
  const [rows] = await pool.query("SELECT * FROM service_packages");
  return rows;
}

// Get one package
async function getPackageByIdModel(id) {
  const [rows] = await pool.query(
    "SELECT * FROM service_packages WHERE servicePackageId = ?",
    [id]
  );
  return rows[0];
}

// Create package
async function createPackageModel(data) {
  const { packageName, packageDescription, packagePrice } = data;
  const [result] = await pool.query(
    "INSERT INTO service_packages (packageName, packageDescription, packagePrice) VALUES (?, ?, ?)",
    [packageName, packageDescription, packagePrice]
  );
  return { id: result.insertId, ...data };
}

// Update package
async function updatePackageModel(id, data) {
  const { packageName, packageDescription, packagePrice } = data;
  const [result] = await pool.query(
    `UPDATE service_packages
     SET packageName = ?, packageDescription = ?, packagePrice = ?
     WHERE servicePackageId = ?`,
    [packageName, packageDescription, packagePrice, id]
  );
  return result;
}

// Delete package
async function deletePackageModel(id) {
  const [result] = await pool.query(
    "DELETE FROM service_packages WHERE servicePackageId = ?",
    [id]
  );
  return result;
}

module.exports = {
  getAllPackagesModel,
  getPackageByIdModel,
  createPackageModel,
  updatePackageModel,
  deletePackageModel,
};
