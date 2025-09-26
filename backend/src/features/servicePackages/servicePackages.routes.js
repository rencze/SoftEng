const express = require("express");
const router = express.Router();

const {
  getAllPackages,
  getPackageById,
  createPackage,
  updatePackage,
  deletePackage,
} = require("./servicePackages.controller");

// Routes
router.get("/", getAllPackages);        // GET all
router.get("/:id", getPackageById);     // GET one
router.post("/", createPackage);        // CREATE
router.put("/:id", updatePackage);      // UPDATE
router.delete("/:id", deletePackage);   // DELETE

module.exports = router;
