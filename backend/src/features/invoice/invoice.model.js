const db = require("../../config/db");

// ===============================
// 🔹 INVOICE CRUD OPERATIONS
// ===============================

// Get all invoices with related data
async function getAllInvoices() {
  const [rows] = await db.query(`
    SELECT 
      i.invoiceId,
      i.quotationId,
      i.issueDate,
      i.totalAmount,
      i.status,
      i.notes,
      i.createdAt,
      i.updatedAt,
      
      -- Generate invoice number
      CONCAT('INV-', LPAD(i.invoiceId, 4, '0')) AS invoiceNumber,
      
      -- Quotation details
      q.quotationNumber,
      q.totalCost AS quotationTotal,
      q.customerName,
      q.customerEmail,
      q.customerPhone,
      q.customerAddress,
      
      -- Service job details if exists
      sj.serviceJobId,
      sj.serviceJobNumber,
      sj.displayPlateNumber,
      sj.displayBrand,
      sj.displayModel,
      
      -- Payment summary
      COALESCE(p.paidAmount, 0) AS paidAmount,
      (i.totalAmount - COALESCE(p.paidAmount, 0)) AS balanceAmount,
      CASE 
        WHEN i.status = 'Paid' THEN 'Paid'
        WHEN COALESCE(p.paidAmount, 0) >= i.totalAmount THEN 'Paid'
        WHEN COALESCE(p.paidAmount, 0) > 0 THEN 'Partial'
        ELSE 'Unpaid'
      END AS paymentStatus

    FROM invoice i
    
    -- Join quotation with customer details
    LEFT JOIN (
      SELECT 
        q.quotationId,
        CONCAT('QTN-', LPAD(q.quotationId, 4, '0')) AS quotationNumber,
        q.totalCost,
        -- Customer details
        CASE 
          WHEN q.serviceRequestId IS NOT NULL THEN CONCAT(sr_cu.firstName, ' ', sr_cu.lastName)
          WHEN q.customerId IS NOT NULL THEN CONCAT(uc.firstName, ' ', uc.lastName)
          ELSE q.guestName
        END AS customerName,
        CASE 
          WHEN q.serviceRequestId IS NOT NULL THEN sr_cu.email
          WHEN q.customerId IS NOT NULL THEN uc.email
          ELSE q.guestEmail
        END AS customerEmail,
        CASE 
          WHEN q.serviceRequestId IS NOT NULL THEN sr_cu.contactNumber
          WHEN q.customerId IS NOT NULL THEN uc.contactNumber
          ELSE q.guestContact
        END AS customerPhone,
        CASE 
          WHEN q.serviceRequestId IS NOT NULL THEN sr_cu.address
          WHEN q.customerId IS NOT NULL THEN uc.address
          ELSE NULL
        END AS customerAddress
      FROM quotation q
      LEFT JOIN serviceRequestBooking srb ON q.serviceRequestId = srb.serviceRequestId
      LEFT JOIN customers sr_c ON srb.customerId = sr_c.customerId
      LEFT JOIN users sr_cu ON sr_c.userId = sr_cu.userId
      LEFT JOIN customers c ON q.customerId = c.customerId
      LEFT JOIN users uc ON c.userId = uc.userId
    ) q ON i.quotationId = q.quotationId
    
    -- Join service job if exists
    LEFT JOIN (
      SELECT 
        sj.serviceJobId,
        sj.quotationId,
        CONCAT('SJ-', LPAD(sj.serviceJobId, 4, '0')) AS serviceJobNumber,
        COALESCE(v.plateNumber, sj.guestPlateNumber) AS displayPlateNumber,
        COALESCE(v.brand, sj.guestBrand) AS displayBrand,
        COALESCE(v.model, sj.guestModel) AS displayModel
      FROM service_job sj
      LEFT JOIN vehicle v ON sj.vehicleId = v.vehicleId
    ) sj ON i.quotationId = sj.quotationId
    
    -- Payment summary
    LEFT JOIN (
      SELECT 
        invoiceId,
        SUM(amount) AS paidAmount
      FROM payment
      GROUP BY invoiceId
    ) p ON i.invoiceId = p.invoiceId
    
    ORDER BY i.issueDate DESC
  `);
  return rows;
}

// Get single invoice by ID with all related data
async function getInvoiceById(id) {
  // Get the main invoice data
  const [invoiceRows] = await db.query(`
    SELECT 
      i.*,
      CONCAT('INV-', LPAD(i.invoiceId, 4, '0')) AS invoiceNumber,
      
      -- Quotation details
      q.quotationNumber,
      q.totalCost AS quotationTotal,
      q.customerName,
      q.customerEmail,
      q.customerPhone,
      q.customerAddress,
      q.technicianName,
      q.laborCost,
      q.partsCost,
      q.discount,
      q.workTimeEstimation,
      q.quote,
      
      -- Service job details
      sj.serviceJobId,
      sj.serviceJobNumber,
      sj.jobDescription,
      COALESCE(v.plateNumber, sj.guestPlateNumber) AS displayPlateNumber,
      COALESCE(v.brand, sj.guestBrand) AS displayBrand,
      COALESCE(v.model, sj.guestModel) AS displayModel,
      COALESCE(v.year, sj.guestYear) AS displayYear,
      
      -- Payment summary
      COALESCE(p.paidAmount, 0) AS paidAmount,
      (i.totalAmount - COALESCE(p.paidAmount, 0)) AS balanceAmount

    FROM invoice i
    
    -- Join quotation with all details
    LEFT JOIN (
      SELECT 
        q.quotationId,
        CONCAT('QTN-', LPAD(q.quotationId, 4, '0')) AS quotationNumber,
        q.totalCost,
        q.laborCost,
        q.partsCost,
        q.discount,
        q.workTimeEstimation,
        q.quote,
        -- Customer details
        CASE 
          WHEN q.serviceRequestId IS NOT NULL THEN CONCAT(sr_cu.firstName, ' ', sr_cu.lastName)
          WHEN q.customerId IS NOT NULL THEN CONCAT(uc.firstName, ' ', uc.lastName)
          ELSE q.guestName
        END AS customerName,
        CASE 
          WHEN q.serviceRequestId IS NOT NULL THEN sr_cu.email
          WHEN q.customerId IS NOT NULL THEN uc.email
          ELSE q.guestEmail
        END AS customerEmail,
        CASE 
          WHEN q.serviceRequestId IS NOT NULL THEN sr_cu.contactNumber
          WHEN q.customerId IS NOT NULL THEN uc.contactNumber
          ELSE q.guestContact
        END AS customerPhone,
        CASE 
          WHEN q.serviceRequestId IS NOT NULL THEN sr_cu.address
          WHEN q.customerId IS NOT NULL THEN uc.address
          ELSE NULL
        END AS customerAddress,
        -- Technician
        CONCAT(ut.firstName, ' ', ut.lastName) AS technicianName
      FROM quotation q
      LEFT JOIN serviceRequestBooking srb ON q.serviceRequestId = srb.serviceRequestId
      LEFT JOIN customers sr_c ON srb.customerId = sr_c.customerId
      LEFT JOIN users sr_cu ON sr_c.userId = sr_cu.userId
      LEFT JOIN customers c ON q.customerId = c.customerId
      LEFT JOIN users uc ON c.userId = uc.userId
      LEFT JOIN technicians tech ON q.technicianId = tech.technicianId
      LEFT JOIN users ut ON tech.userId = ut.userId
    ) q ON i.quotationId = q.quotationId
    
    -- Join service job
    LEFT JOIN service_job sj ON i.quotationId = sj.quotationId
    LEFT JOIN vehicle v ON sj.vehicleId = v.vehicleId
    
    -- Payment summary
    LEFT JOIN (
      SELECT 
        invoiceId,
        SUM(amount) AS paidAmount
      FROM payment
      GROUP BY invoiceId
    ) p ON i.invoiceId = p.invoiceId
    
    WHERE i.invoiceId = ?
  `, [id]);

  if (!invoiceRows[0]) return null;

  const invoice = invoiceRows[0];

  // Get invoice services
  const [services] = await db.query(`
    SELECT 
      isvc.*,
      s.servicesName,
      s.servicesDescription
    FROM invoice_services isvc
    LEFT JOIN services s ON isvc.serviceId = s.servicesId
    WHERE isvc.invoiceId = ?
  `, [id]);

  // Get invoice packages
  const [servicePackages] = await db.query(`
    SELECT 
      ipkg.*,
      sp.packageName,
      sp.packageDescription
    FROM invoice_packages ipkg
    LEFT JOIN service_packages sp ON ipkg.servicePackageId = sp.servicePackageId
    WHERE ipkg.invoiceId = ?
  `, [id]);

  // Get invoice parts
  const [parts] = await db.query(`
    SELECT 
      ip.*,
      p.partName,
      p.partDescription
    FROM invoice_parts ip
    LEFT JOIN parts p ON ip.partId = p.partId
    WHERE ip.invoiceId = ?
  `, [id]);

  // Get payments
  const [payments] = await db.query(`
    SELECT 
      p.*,
      CONCAT('PAY-', LPAD(p.paymentId, 4, '0')) AS paymentNumber
    FROM payment p
    WHERE p.invoiceId = ?
    ORDER BY p.paymentDate DESC
  `, [id]);

  // Combine all data
  return {
    ...invoice,
    services: services || [],
    servicePackages: servicePackages || [],
    parts: parts || [],
    payments: payments || []
  };
}

// Create new invoice from quotation
async function createInvoice(invoiceData) {
  const {
    quotationId,
    issueDate = new Date(),
    notes,
    status = 'Pending'
  } = invoiceData;

  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    // Get quotation details to calculate total
    const [quotation] = await connection.query(`
      SELECT totalCost, laborCost, partsCost, discount 
      FROM quotation 
      WHERE quotationId = ?
    `, [quotationId]);

    if (!quotation[0]) {
      throw new Error('Quotation not found');
    }

    const totalAmount = quotation[0].totalCost;

    // Insert invoice
    const [result] = await connection.query(
      `INSERT INTO invoice 
      (quotationId, issueDate, totalAmount, notes, status)
      VALUES (?, ?, ?, ?, ?)`,
      [quotationId, issueDate, totalAmount, notes, status]
    );

    const invoiceId = result.insertId;

    // Copy services from quotation to invoice_services
    const [quotationServices] = await connection.query(`
      SELECT serviceId, serviceName, serviceDescription, quantity, price
      FROM quotation_services 
      WHERE quotationId = ?
    `, [quotationId]);

    for (const service of quotationServices) {
      const total = service.price * service.quantity;
      await connection.query(
        `INSERT INTO invoice_services 
        (invoiceId, serviceId, serviceName, serviceDescription, quantity, price, total)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [invoiceId, service.serviceId, service.serviceName, service.serviceDescription, service.quantity, service.price, total]
      );
    }

    // Copy packages from quotation to invoice_packages
    const [quotationPackages] = await connection.query(`
      SELECT servicePackageId, packageName, packageDescription, quantity, price
      FROM quotation_packages 
      WHERE quotationId = ?
    `, [quotationId]);

    for (const pkg of quotationPackages) {
      const total = pkg.price * pkg.quantity;
      await connection.query(
        `INSERT INTO invoice_packages 
        (invoiceId, servicePackageId, packageName, packageDescription, quantity, price, total)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [invoiceId, pkg.servicePackageId, pkg.packageName, pkg.packageDescription, pkg.quantity, pkg.price, total]
      );
    }

    // Copy parts from quotation to invoice_parts
    const [quotationParts] = await connection.query(`
      SELECT partId, quantity, unitPrice
      FROM quotation_parts 
      WHERE quotationId = ?
    `, [quotationId]);

    for (const part of quotationParts) {
      const total = part.unitPrice * part.quantity;
      // Get part details
      const [partDetails] = await connection.query(
        'SELECT partName, partDescription FROM parts WHERE partId = ?',
        [part.partId]
      );
      
      const partDetail = partDetails[0];
      await connection.query(
        `INSERT INTO invoice_parts 
        (invoiceId, partId, partName, partDescription, quantity, unitPrice, total)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [invoiceId, part.partId, partDetail?.partName || 'Unknown Part', partDetail?.partDescription || '', part.quantity, part.unitPrice, total]
      );
    }

    await connection.commit();
    return getInvoiceById(invoiceId);

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// Update invoice
async function updateInvoice(id, invoiceData) {
  const {
    issueDate,
    totalAmount,
    notes,
    status
  } = invoiceData;

  await db.query(
    `UPDATE invoice SET 
    issueDate = ?, totalAmount = ?, notes = ?, status = ?, updatedAt = CURRENT_TIMESTAMP
    WHERE invoiceId = ?`,
    [issueDate, totalAmount, notes, status, id]
  );

  return getInvoiceById(id);
}

// Delete invoice
async function deleteInvoice(id) {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    // Delete related records first
    await connection.query("DELETE FROM invoice_services WHERE invoiceId = ?", [id]);
    await connection.query("DELETE FROM invoice_packages WHERE invoiceId = ?", [id]);
    await connection.query("DELETE FROM invoice_parts WHERE invoiceId = ?", [id]);
    await connection.query("DELETE FROM payment WHERE invoiceId = ?", [id]);
    
    const [result] = await connection.query("DELETE FROM invoice WHERE invoiceId = ?", [id]);
    
    await connection.commit();
    return { message: "Invoice deleted successfully" };

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// Update invoice status
async function updateInvoiceStatus(id, status) {
  await db.query(
    "UPDATE invoice SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE invoiceId = ?",
    [status, id]
  );
  return getInvoiceById(id);
}

// ===============================
// 🔹 PAYMENT OPERATIONS
// ===============================

// Add payment to invoice
async function addPaymentToInvoice(invoiceId, paymentData) {
  const {
    paymentDate = new Date(),
    paymentMethod = 'Cash',
    amount,
    transactionReference,
    notes
  } = paymentData;

  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    // Insert payment
    const [result] = await connection.query(
      `INSERT INTO payment 
      (invoiceId, paymentDate, paymentMethod, amount, transactionReference, notes)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [invoiceId, paymentDate, paymentMethod, amount, transactionReference, notes]
    );

    // Check if invoice should be marked as paid
    const [paymentSummary] = await connection.query(`
      SELECT SUM(amount) as totalPaid 
      FROM payment 
      WHERE invoiceId = ?
    `, [invoiceId]);

    const [invoice] = await connection.query(`
      SELECT totalAmount 
      FROM invoice 
      WHERE invoiceId = ?
    `, [invoiceId]);

    const totalPaid = paymentSummary[0].totalPaid;
    const invoiceTotal = invoice[0].totalAmount;

    // Update invoice status if fully paid
    if (totalPaid >= invoiceTotal) {
      await connection.query(
        "UPDATE invoice SET status = 'Paid' WHERE invoiceId = ?",
        [invoiceId]
      );
    }

    await connection.commit();

    return { 
      id: result.insertId, 
      invoiceId, 
      paymentDate, 
      paymentMethod, 
      amount,
      transactionReference,
      notes
    };

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// Get payments for invoice
async function getInvoicePayments(invoiceId) {
  const [rows] = await db.query(`
    SELECT 
      p.*,
      CONCAT('PAY-', LPAD(p.paymentId, 4, '0')) AS paymentNumber
    FROM payment p
    WHERE p.invoiceId = ?
    ORDER BY p.paymentDate DESC
  `, [invoiceId]);
  return rows;
}

// Update payment
async function updatePayment(paymentId, paymentData) {
  const {
    paymentDate,
    paymentMethod,
    amount,
    transactionReference,
    notes
  } = paymentData;

  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    // Get invoice ID first
    const [payment] = await connection.query(
      "SELECT invoiceId FROM payment WHERE paymentId = ?",
      [paymentId]
    );

    if (!payment[0]) {
      throw new Error('Payment not found');
    }

    const invoiceId = payment[0].invoiceId;

    // Update payment
    await connection.query(
      `UPDATE payment SET 
      paymentDate = ?, paymentMethod = ?, amount = ?, transactionReference = ?, notes = ?
      WHERE paymentId = ?`,
      [paymentDate, paymentMethod, amount, transactionReference, notes, paymentId]
    );

    // Recalculate invoice status
    const [paymentSummary] = await connection.query(`
      SELECT SUM(amount) as totalPaid 
      FROM payment 
      WHERE invoiceId = ?
    `, [invoiceId]);

    const [invoice] = await connection.query(`
      SELECT totalAmount 
      FROM invoice 
      WHERE invoiceId = ?
    `, [invoiceId]);

    const totalPaid = paymentSummary[0].totalPaid;
    const invoiceTotal = invoice[0].totalAmount;

    // Update invoice status
    const newStatus = totalPaid >= invoiceTotal ? 'Paid' : 'Pending';
    await connection.query(
      "UPDATE invoice SET status = ? WHERE invoiceId = ?",
      [newStatus, invoiceId]
    );

    await connection.commit();

    const [updatedPayment] = await connection.query(
      "SELECT * FROM payment WHERE paymentId = ?",
      [paymentId]
    );

    return updatedPayment[0];

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// Delete payment
async function deletePayment(paymentId) {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    // Get invoice ID first
    const [payment] = await connection.query(
      "SELECT invoiceId FROM payment WHERE paymentId = ?",
      [paymentId]
    );

    if (!payment[0]) {
      throw new Error('Payment not found');
    }

    const invoiceId = payment[0].invoiceId;

    // Delete payment
    await connection.query("DELETE FROM payment WHERE paymentId = ?", [paymentId]);

    // Recalculate invoice status
    const [paymentSummary] = await connection.query(`
      SELECT SUM(amount) as totalPaid 
      FROM payment 
      WHERE invoiceId = ?
    `, [invoiceId]);

    const [invoice] = await connection.query(`
      SELECT totalAmount 
      FROM invoice 
      WHERE invoiceId = ?
    `, [invoiceId]);

    const totalPaid = paymentSummary[0].totalPaid || 0;
    const invoiceTotal = invoice[0].totalAmount;

    // Update invoice status
    const newStatus = totalPaid >= invoiceTotal ? 'Paid' : 'Pending';
    await connection.query(
      "UPDATE invoice SET status = ? WHERE invoiceId = ?",
      [newStatus, invoiceId]
    );

    await connection.commit();
    return { message: "Payment deleted successfully" };

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// ===============================
// 🔹 QUERY OPERATIONS
// ===============================

// Get invoices by status
async function getInvoicesByStatus(status) {
  const [rows] = await db.query(`
    SELECT 
      i.*,
      CONCAT('INV-', LPAD(i.invoiceId, 4, '0')) AS invoiceNumber,
      q.quotationNumber,
      q.customerName,
      COALESCE(p.paidAmount, 0) AS paidAmount,
      (i.totalAmount - COALESCE(p.paidAmount, 0)) AS balanceAmount
    FROM invoice i
    LEFT JOIN (
      SELECT 
        quotationId,
        CONCAT('QTN-', LPAD(quotationId, 4, '0')) AS quotationNumber,
        CASE 
          WHEN serviceRequestId IS NOT NULL THEN CONCAT(sr_cu.firstName, ' ', sr_cu.lastName)
          WHEN customerId IS NOT NULL THEN CONCAT(uc.firstName, ' ', uc.lastName)
          ELSE guestName
        END AS customerName
      FROM quotation q
      LEFT JOIN serviceRequestBooking srb ON q.serviceRequestId = srb.serviceRequestId
      LEFT JOIN customers sr_c ON srb.customerId = sr_c.customerId
      LEFT JOIN users sr_cu ON sr_c.userId = sr_cu.userId
      LEFT JOIN customers c ON q.customerId = c.customerId
      LEFT JOIN users uc ON c.userId = uc.userId
    ) q ON i.quotationId = q.quotationId
    LEFT JOIN (
      SELECT 
        invoiceId,
        SUM(amount) AS paidAmount
      FROM payment
      GROUP BY invoiceId
    ) p ON i.invoiceId = p.invoiceId
    WHERE i.status = ?
    ORDER BY i.issueDate DESC
  `, [status]);
  return rows;
}

// Get invoices by customer (via quotation)
async function getInvoicesByCustomer(customerId) {
  const [rows] = await db.query(`
    SELECT 
      i.*,
      CONCAT('INV-', LPAD(i.invoiceId, 4, '0')) AS invoiceNumber,
      q.quotationNumber,
      q.customerName,
      COALESCE(p.paidAmount, 0) AS paidAmount,
      (i.totalAmount - COALESCE(p.paidAmount, 0)) AS balanceAmount
    FROM invoice i
    JOIN quotation q ON i.quotationId = q.quotationId
    LEFT JOIN (
      SELECT 
        invoiceId,
        SUM(amount) AS paidAmount
      FROM payment
      GROUP BY invoiceId
    ) p ON i.invoiceId = p.invoiceId
    WHERE q.customerId = ?
    ORDER BY i.issueDate DESC
  `, [customerId]);
  return rows;
}

// Get payment summary
async function getPaymentSummary() {
  const [rows] = await db.query(`
    SELECT 
      -- Total invoices
      COUNT(*) AS totalInvoices,
      SUM(totalAmount) AS totalInvoiceAmount,
      
      -- Paid invoices
      SUM(CASE WHEN status = 'Paid' THEN 1 ELSE 0 END) AS paidInvoices,
      SUM(CASE WHEN status = 'Paid' THEN totalAmount ELSE 0 END) AS paidAmount,
      
      -- Pending invoices
      SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) AS pendingInvoices,
      SUM(CASE WHEN status = 'Pending' THEN totalAmount ELSE 0 END) AS pendingAmount,
      
      -- This month stats
      SUM(CASE WHEN MONTH(issueDate) = MONTH(CURRENT_DATE()) AND YEAR(issueDate) = YEAR(CURRENT_DATE()) THEN 1 ELSE 0 END) AS thisMonthInvoices,
      SUM(CASE WHEN MONTH(issueDate) = MONTH(CURRENT_DATE()) AND YEAR(issueDate) = YEAR(CURRENT_DATE()) THEN totalAmount ELSE 0 END) AS thisMonthAmount
    FROM invoice
  `);
  return rows[0] || {};
}

module.exports = {
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
};