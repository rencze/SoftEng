//resgiteredVehicle.controller.js

const { 
  getAllRegisteredVehicles, 
  registerVehicle, 
  removeRegisteredVehicle, 
  getOwnershipHistory 
} = require("./registeredVehicle.model");

// Fetch all
async function fetchRegisteredVehicles(_req, res) {
  try {
    const vehicles = await getAllRegisteredVehicles();
    res.json(vehicles);
  } catch (err) {
    console.error("Fetch registered vehicles error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// Register or update
async function registerVehicleController(req, res) {
  try {
    const { vehicleId, customerId } = req.body;
    if (!vehicleId || !customerId)
      return res.status(400).json({ message: "vehicleId and customerId are required" });

    const result = await registerVehicle(vehicleId, customerId);
    res.status(201).json({ message: "Vehicle registered successfully", result });
  } catch (err) {
    console.error("Register vehicle error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// Remove
async function removeRegisteredVehicleController(req, res) {
  try {
    const { vehicleId } = req.params;
    const result = await removeRegisteredVehicle(vehicleId);
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Vehicle not found" });

    res.json({ message: "Vehicle unregistered successfully" });
  } catch (err) {
    console.error("Remove registered vehicle error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// History
async function fetchOwnershipHistory(req, res) {
  try {
    const { vehicleId } = req.params;
    const history = await getOwnershipHistory(vehicleId);
    res.json(history);
  } catch (err) {
    console.error("Fetch ownership history error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = { 
  fetchRegisteredVehicles, 
  registerVehicleController, 
  removeRegisteredVehicleController,
  fetchOwnershipHistory
};

