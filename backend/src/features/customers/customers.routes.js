const express = require("express");
const router = express.Router();
const authenticateToken = require("../../middlewares/authMiddleware");
const { 
  fetchCustomers, 
  addCustomerController, 
  removeCustomerController 
} = require("./customers.controller");

// Get all customers
router.get("/", authenticateToken, fetchCustomers);

// Add customer manually
router.post("/", authenticateToken, addCustomerController);

// Remove customer manually
router.delete("/:userId", authenticateToken, removeCustomerController);

module.exports = router;