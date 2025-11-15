const express = require("express");
const router = express.Router();
const { 
  fetchPayments, 
  fetchPaymentById, 
  addPaymentController, 
  removePaymentController 
} = require("./payments.controller");

// Get all payments
router.get("/", fetchPayments);

// Get single payment
router.get("/:paymentsId", fetchPaymentById);

// Add payment
router.post("/", addPaymentController);

// Remove payment
router.delete("/:paymentsId", removePaymentController);

module.exports = router;
