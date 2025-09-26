const pool = require("../../config/db");

// Get all services
async function getAllServicesModel() {
  const [rows] = await pool.query("SELECT * FROM services");
  return rows;
}

// Get one service by ID
async function getServiceByIdModel(id) {
  const [rows] = await pool.query("SELECT * FROM services WHERE servicesId = ?", [id]);
  return rows[0];
}

// Create service
async function createServiceModel(data) {
  const { servicesName, servicesDescription, price } = data;
  const [result] = await pool.query(
    "INSERT INTO services (servicesName, servicesDescription, price) VALUES (?, ?, ?)",
    [servicesName, servicesDescription, price]
  );
  return { id: result.insertId, ...data };
}

// Update service
async function updateServiceModel(id, data) {
  const { servicesName, servicesDescription, price } = data;
  const [result] = await pool.query(
    `UPDATE services 
     SET servicesName = ?, servicesDescription = ?, price = ?
     WHERE servicesId = ?`,
    [servicesName, servicesDescription, price, id]
  );
  return result;
}

// Delete service
async function deleteServiceModel(id) {
  const [result] = await pool.query("DELETE FROM services WHERE servicesId = ?", [id]);
  return result;
}

module.exports = {
  getAllServicesModel,
  getServiceByIdModel,
  createServiceModel,
  updateServiceModel,
  deleteServiceModel,
};
