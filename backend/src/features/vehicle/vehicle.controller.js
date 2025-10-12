const {
  getAllVehiclesModel,
  getVehicleByIdModel,
  createVehicleModel,
  updateVehicleModel,
  deleteVehicleModel,
} = require("./vehicle.model");

// Get all
async function getAllVehicles(req, res) {
  try {
    const vehicles = await getAllVehiclesModel();
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get one
async function getVehicleById(req, res) {
  try {
    const { id } = req.params;
    const vehicle = await getVehicleByIdModel(id);
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Create
async function createVehicle(req, res) {
  try {
    const result = await createVehicleModel(req.body);
    res.status(201).json(result); // return only the created vehicle
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}


// async function createVehicle(req, res) {
//   try {
//     const result = await createVehicleModel(req.body);
//     res.status(201).json({ message: "Vehicle created", vehicle: result });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// }

// Update
async function updateVehicle(req, res) {
  try {
    const { id } = req.params;
    const result = await updateVehicleModel(id, req.body);
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Vehicle not found" });
    res.json({ message: "Vehicle updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Delete
async function deleteVehicle(req, res) {
  try {
    const { id } = req.params;
    const result = await deleteVehicleModel(id);
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Vehicle not found" });
    res.json({ message: "Vehicle deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
};
