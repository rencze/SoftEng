const express = require("express");
const router = express.Router();

const {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} = require("./vehicle.controller");

// Routes
router.get("/", getAllVehicles);        // GET all
router.get("/:id", getVehicleById);     // GET one
router.post("/", createVehicle);        // CREATE
router.put("/:id", updateVehicle);      // UPDATE
router.delete("/:id", deleteVehicle);   // DELETE

module.exports = router;