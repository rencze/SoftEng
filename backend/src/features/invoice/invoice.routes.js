const express = require("express");
const router = express.Router();

const {
  fetchInvoices,
  fetchInvoice,
  createInvoiceController,
  updateInvoiceController,
  deleteInvoiceController,
  updateInvoiceStatusController,
  addPaymentController,
  fetchInvoicePayments,
  updatePaymentController,
  deletePaymentController,
  fetchInvoicesByStatus,
  fetchInvoicesByCustomer,
  fetchPaymentSummary
} = require("./invoice.controller");

// 🔹 Main invoice routes
router.get("/", fetchInvoices);
router.post("/", createInvoiceController);
router.get("/summary", fetchPaymentSummary);
router.get("/status/:status", fetchInvoicesByStatus);
router.get("/customer/:customerId", fetchInvoicesByCustomer);

// 🔹 Single invoice routes
router.get("/:id", fetchInvoice);
router.put("/:id", updateInvoiceController);
router.delete("/:id", deleteInvoiceController);
router.patch("/:id/status", updateInvoiceStatusController);

// 🔹 Payment routes
router.get("/:id/payments", fetchInvoicePayments);
router.post("/:id/payments", addPaymentController);
router.put("/payments/:paymentId", updatePaymentController);
router.delete("/payments/:paymentId", deletePaymentController);

module.exports = router;