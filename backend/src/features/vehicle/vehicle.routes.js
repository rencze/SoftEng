const express = require("express");
const router = express.Router();

const {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} = require("./vehicle.controller");

// Make sure this route is included
router.get("/", getAllVehicles);
router.get("/:id", getVehicleById);

router.post("/", createVehicle);
router.put("/:id", updateVehicle);
router.delete("/:id", deleteVehicle);

module.exports = router;