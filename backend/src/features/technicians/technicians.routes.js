  const express = require("express");
  const router = express.Router();
  const authenticateToken = require("../../middlewares/authMiddleware");
  const { 
    fetchTechnicians, 
    addTechnicianController, 
    removeTechnicianController 
  } = require("./technicians.controller");

  // Get all technicians
  router.get("/", authenticateToken, fetchTechnicians);

  // Add technician manually (optional)
  router.post("/", authenticateToken, addTechnicianController);

  // Remove technician manually (optional)
  router.delete("/:userId", authenticateToken, removeTechnicianController);

  module.exports = router;
