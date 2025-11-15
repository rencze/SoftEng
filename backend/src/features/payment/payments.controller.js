const { getAllPayments, getPaymentById, addPayment, removePayment } = require("./payments.model");

// Fetch all payments
async function fetchPayments(_req, res) {
  try {
    const payments = await getAllPayments();
    res.json(payments);
  } catch (err) {
    console.error("Fetch payments error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// Fetch single payment by ID
async function fetchPaymentById(req, res) {
  try {
    const { paymentsId } = req.params;
    const payment = await getPaymentById(paymentsId);
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    res.json(payment);
  } catch (err) {
    console.error("Fetch payment error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// Add new payment
async function addPaymentController(req, res) {
  try {
    const { quotationId, amount, payment_method, status, date, invoice_number, type, reference_number, description, notes } = req.body;
    if (!quotationId || !amount || !payment_method || !date) {
      return res.status(400).json({ message: "quotationId, amount, payment_method, and date are required" });
    }

    const result = await addPayment({ quotationId, amount, payment_method, status, date, invoice_number, type, reference_number, description, notes });
    res.status(201).json({ message: "Payment added successfully", result });
  } catch (err) {
    console.error("Add payment error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// Remove payment
async function removePaymentController(req, res) {
  try {
    const { paymentsId } = req.params;
    const result = await removePayment(paymentsId);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Payment not found" });
    res.json({ message: "Payment removed successfully" });
  } catch (err) {
    console.error("Remove payment error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = { fetchPayments, fetchPaymentById, addPaymentController, removePaymentController };
