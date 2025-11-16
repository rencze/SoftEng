const pool = require("../../config/db");

// Get all vehicles
async function getAllVehiclesModel() {
  const [rows] = await pool.query("SELECT * FROM vehicle");
  return rows;
}

// Get one vehicle by ID
async function getVehicleByIdModel(id) {
  const [rows] = await pool.query(
    "SELECT * FROM vehicle WHERE vehicleId = ?",
    [id]
  );
  return rows[0];
}

// Create vehicle
async function createVehicleModel(data) {
  const { plateNumber, brand, model, year } = data;
  const [result] = await pool.query(
    "INSERT INTO vehicle (plateNumber, brand, model, year) VALUES (?, ?, ?, ?)",
    [plateNumber, brand, model, year]
  );
  return { vehicleId: result.insertId, plateNumber, brand, model, year };
}

// Update vehicle
async function updateVehicleModel(id, data) {
  const { plateNumber, brand, model, year } = data;
  const [result] = await pool.query(
    `UPDATE vehicle
     SET plateNumber = ?, brand = ?, model = ?, year = ?
     WHERE vehicleId = ?`,
    [plateNumber, brand, model, year, id]
  );
  return result;
}

// Delete vehicle
async function deleteVehicleModel(id) {
  const [result] = await pool.query(
    "DELETE FROM vehicle WHERE vehicleId = ?",
    [id]
  );
  return result;
}

module.exports = {
  getAllVehiclesModel,
  getVehicleByIdModel,
  createVehicleModel,
  updateVehicleModel,
  deleteVehicleModel,
 
};