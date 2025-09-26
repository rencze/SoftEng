const express = require("express");
const router = express.Router();

const {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
} = require("./services.controller");

// Routes
router.get("/", getAllServices);          // GET all
router.get("/:id", getServiceById);       // GET one
router.post("/", createService);          // CREATE
router.put("/:id", updateService);        // UPDATE
router.delete("/:id", deleteService);     // DELETE

module.exports = router;
