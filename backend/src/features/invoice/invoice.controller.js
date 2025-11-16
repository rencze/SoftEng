const {
  getAllInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  updateInvoiceStatus,
  addPaymentToInvoice,
  getInvoicePayments,
  updatePayment,
  deletePayment,
  getInvoicesByStatus,
  getInvoicesByCustomer,
  getPaymentSummary
} = require("./invoice.model");

// Get all invoices
async function fetchInvoices(req, res) {
  try {
    const invoices = await getAllInvoices();
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get single invoice
async function fetchInvoice(req, res) {
  try {
    const invoice = await getInvoiceById(req.params.id);
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Create new invoice from quotation
async function createInvoiceController(req, res) {
  try {
    const {
      quotationId,
      issueDate,
      notes,
      status = 'Pending'
    } = req.body;

    console.log('Creating invoice:', {
      quotationId,
      issueDate,
      status
    });

    if (!quotationId) {
      return res.status(400).json({ error: "quotationId is required" });
    }

    const newInvoice = await createInvoice({
      quotationId,
      issueDate,
      notes,
      status
    });

    console.log('Invoice created successfully:', {
      id: newInvoice.invoiceId,
      invoiceNumber: newInvoice.invoiceNumber,
      totalAmount: newInvoice.totalAmount
    });

    res.status(201).json(newInvoice);
  } catch (err) {
    console.error('Error creating invoice:', err);
    res.status(500).json({ error: err.message });
  }
}

// Update invoice
async function updateInvoiceController(req, res) {
  try {
    const invoice = await getInvoiceById(req.params.id);
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });

    const updatedInvoice = await updateInvoice(req.params.id, req.body);
    res.json(updatedInvoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Delete invoice
async function deleteInvoiceController(req, res) {
  try {
    const invoice = await getInvoiceById(req.params.id);
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });

    await deleteInvoice(req.params.id);
    res.json({ message: "Invoice deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Update invoice status
async function updateInvoiceStatusController(req, res) {
  try {
    const invoice = await getInvoiceById(req.params.id);
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });

    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    const validStatuses = ['Pending', 'Paid'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const updatedInvoice = await updateInvoiceStatus(req.params.id, status);
    res.json(updatedInvoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Add payment to invoice
async function addPaymentController(req, res) {
  try {
    const invoice = await getInvoiceById(req.params.id);
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });

    const {
      paymentDate,
      paymentMethod = 'Cash',
      amount,
      transactionReference,
      notes
    } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Valid amount is required" });
    }

    const result = await addPaymentToInvoice(req.params.id, {
      paymentDate,
      paymentMethod,
      amount: parseFloat(amount),
      transactionReference,
      notes
    });

    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get invoice payments
async function fetchInvoicePayments(req, res) {
  try {
    const invoice = await getInvoiceById(req.params.id);
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });

    const payments = await getInvoicePayments(req.params.id);
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Update payment
async function updatePaymentController(req, res) {
  try {
    const { paymentId } = req.params;
    const {
      paymentDate,
      paymentMethod,
      amount,
      transactionReference,
      notes
    } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Valid amount is required" });
    }

    const updatedPayment = await updatePayment(paymentId, {
      paymentDate,
      paymentMethod,
      amount: parseFloat(amount),
      transactionReference,
      notes
    });

    if (!updatedPayment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    res.json(updatedPayment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Delete payment
async function deletePaymentController(req, res) {
  try {
    const { paymentId } = req.params;

    await deletePayment(paymentId);
    res.json({ message: "Payment deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get invoices by status
async function fetchInvoicesByStatus(req, res) {
  try {
    const { status } = req.params;
    const invoices = await getInvoicesByStatus(status);
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get invoices by customer
async function fetchInvoicesByCustomer(req, res) {
  try {
    const { customerId } = req.params;
    const invoices = await getInvoicesByCustomer(customerId);
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get payment summary
async function fetchPaymentSummary(req, res) {
  try {
    const summary = await getPaymentSummary();
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
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
};