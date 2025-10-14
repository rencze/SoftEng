const express = require("express");
const router = express.Router();
const authenticateToken = require("../../middlewares/authMiddleware");
const { 
  fetchRegisteredVehicles, 
  registerVehicleController, 
  removeRegisteredVehicleController,
  fetchOwnershipHistory
} = require("./registeredVehicle.controller");

// Get all registered vehicles
router.get("/", authenticateToken, fetchRegisteredVehicles);

// Register/update vehicle
router.post("/", authenticateToken, registerVehicleController);

// Remove vehicle registration
router.delete("/:vehicleId", authenticateToken, removeRegisteredVehicleController);

// Get ownership history
router.get("/history/:vehicleId", authenticateToken, fetchOwnershipHistory);

module.exports = router;

