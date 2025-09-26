const express = require("express");
const router = express.Router();
const {
  fetchParts,
  fetchPart,
  createPartController,
  updatePartController,
  deletePartController
} = require("./parts.controller");

// Get all parts
router.get("/", fetchParts);

// Get single part by ID
router.get("/:id", fetchPart);

// Create new part
router.post("/", createPartController);

// Update part
router.put("/:id", updatePartController);

// Delete part
router.delete("/:id", deletePartController);

module.exports = router;
