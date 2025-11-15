const pool = require("../../config/db");

// Get all payments
async function getAllPayments() {
  const [rows] = await pool.query(`
    SELECT 
      p.*,
      q.customerId,
      q.guestName,
      q.guestEmail,
      q.guestContact
    FROM payments p
    JOIN quotation q ON p.quotationId = q.quotationId
    ORDER BY p.date DESC
  `);
  return rows;
}

// Get payment by ID
async function getPaymentById(paymentsId) {
  const [rows] = await pool.query(`
    SELECT 
      p.*,
      q.customerId,
      q.guestName,
      q.guestEmail,
      q.guestContact
    FROM payments p
    JOIN quotation q ON p.quotationId = q.quotationId
    WHERE p.paymentsId = ?
  `, [paymentsId]);
  return rows[0];
}

// Add payment
async function addPayment(data) {
  const { quotationId, amount, payment_method, status, date, invoice_number, type, reference_number, description, notes } = data;
  const [result] = await pool.query(`
    INSERT INTO payments 
      (quotationId, amount, payment_method, status, date, invoice_number, type, reference_number, description, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [quotationId, amount, payment_method, status || 'Pending', date, invoice_number, type || 'Payment', reference_number, description, notes]);
  return result;
}

// Remove payment
async function removePayment(paymentsId) {
  const [result] = await pool.query(`
    DELETE FROM payments WHERE paymentsId = ?
  `, [paymentsId]);
  return result;
}

module.exports = { getAllPayments, getPaymentById, addPayment, removePayment };
