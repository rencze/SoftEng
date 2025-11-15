const db = require("../../config/db");

// ===============================
// 🔹 QUOTATION CRUD OPERATIONS
// ===============================

// Get all quotations with related data - FIXED VERSION
async function getAllQuotations() {
  const [rows] = await db.query(`
    SELECT 
      q.quotationId,
      q.serviceRequestId,
      q.bookingId,
      q.technicianId,
      q.customerId,
      q.guestName,
      q.guestContact,
      q.guestEmail,
      q.laborCost,
      q.partsCost,
      q.discount,
      q.totalCost,
      q.workTimeEstimation,
      q.quote,
      q.status,
      q.createdAt,
      q.updatedAt,
      q.approvedAt,
      -- Generate quotation number
      CONCAT('QTN-', LPAD(q.quotationId, 4, '0')) AS quotationNumber,
      -- Generate booking number if bookingId exists
      CASE 
        WHEN q.bookingId IS NOT NULL THEN CONCAT('BK-', LPAD(q.bookingId, 4, '0'))
        ELSE NULL 
      END AS bookingNumber,
      -- Technician name
      CONCAT(ut.firstName, ' ', ut.lastName) AS technicianName,
      -- SIMPLIFIED: Customer name handling
      CASE 
        WHEN q.customerId IS NOT NULL THEN CONCAT(uc.firstName, ' ', uc.lastName)
        ELSE q.guestName
      END AS customerName,
      -- SIMPLIFIED: Email handling
      CASE 
        WHEN q.customerId IS NOT NULL THEN uc.email
        ELSE q.guestEmail
      END AS email,
      -- SIMPLIFIED: Contact handling
      CASE 
        WHEN q.customerId IS NOT NULL THEN uc.contactNumber
        ELSE q.guestContact
      END AS phone,
      -- Address (only for registered customers)
      CASE 
        WHEN q.customerId IS NOT NULL THEN uc.address
        ELSE 'Guest Customer'
      END AS address
    FROM quotation q
    -- Join technicians -> users for technician name
    LEFT JOIN technicians t ON q.technicianId = t.technicianId
    LEFT JOIN users ut ON t.userId = ut.userId
    -- Join customers -> users for customer name (LEFT JOIN to handle guest customers)
    LEFT JOIN customers c ON q.customerId = c.customerId
    LEFT JOIN users uc ON c.userId = uc.userId
    ORDER BY q.createdAt DESC
  `);
  return rows;
}

// Get single quotation by ID - FIXED VERSION
// Get single quotation by ID with all related data - UPDATED
async function getQuotationById(id) {
  // Get the main quotation data
  const [quotationRows] = await db.query(`
    SELECT 
      q.*,
      -- Generate quotation number
      CONCAT('QTN-', LPAD(q.quotationId, 4, '0')) AS quotationNumber,
      -- Generate booking number if bookingId exists
      CASE 
        WHEN q.bookingId IS NOT NULL THEN CONCAT('BK-', LPAD(q.bookingId, 4, '0'))
        ELSE NULL 
      END AS bookingNumber,
      -- Technician name
      CONCAT(ut.firstName, ' ', ut.lastName) AS technicianName,
      -- SIMPLIFIED: Customer name handling
      CASE 
        WHEN q.customerId IS NOT NULL THEN CONCAT(uc.firstName, ' ', uc.lastName)
        ELSE q.guestName
      END AS customerName,
      -- SIMPLIFIED: Email handling
      CASE 
        WHEN q.customerId IS NOT NULL THEN uc.email
        ELSE q.guestEmail
      END AS email,
      -- SIMPLIFIED: Contact handling
      CASE 
        WHEN q.customerId IS NOT NULL THEN uc.contactNumber
        ELSE q.guestContact
      END AS phone
    FROM quotation q
    -- Join technicians -> users for technician name
    LEFT JOIN technicians t ON q.technicianId = t.technicianId
    LEFT JOIN users ut ON t.userId = ut.userId
    -- Join customers -> users for customer name
    LEFT JOIN customers c ON q.customerId = c.customerId
    LEFT JOIN users uc ON c.userId = uc.userId
    WHERE q.quotationId = ?
  `, [id]);

  if (!quotationRows[0]) return null;

  const quotation = quotationRows[0];

  // Get services for this quotation
  const [services] = await db.query(`
    SELECT 
      qs.*,
      s.servicesName,
      s.servicesDescription
    FROM quotation_services qs
    LEFT JOIN services s ON qs.serviceId = s.servicesId
    WHERE qs.quotationId = ?
  `, [id]);

  // Get packages for this quotation
  const [servicePackages] = await db.query(`
    SELECT 
      qp.*,
      sp.packageName,
      sp.packageDescription
    FROM quotation_packages qp
    LEFT JOIN service_packages sp ON qp.servicePackageId = sp.servicePackageId
    WHERE qp.quotationId = ?
  `, [id]);

  // Get custom parts for this quotation
  const [customParts] = await db.query(`
    SELECT 
      qp.*,
      p.partName,
      p.partDescription
    FROM quotation_parts qp
    LEFT JOIN parts p ON qp.partId = p.partId
    WHERE qp.quotationId = ?
  `, [id]);

  // Combine all data
  return {
    ...quotation,
    services: services || [],
    servicePackages: servicePackages || [],
    customParts: customParts || []
  };
}

// Create new quotation - UPDATED to set status as "Pending" (isModified removed)
async function createQuotation(quotationData) {
  const {
    serviceRequestId,
    bookingId,
    technicianId,
    customerId,
    guestName,
    guestContact,
    guestEmail,
    laborCost = 0,
    discount = 0,
    workTimeEstimation,
    quote,
    validity,
    services = [],
    servicePackages = [],
    customParts = [],
    status = 'Pending' // REMOVED: isModified parameter
  } = quotationData;

  // Calculate parts cost from services, packages, and custom parts
  const servicesCost = services.reduce((sum, service) => sum + (service.price || 0), 0);
  const packagesCost = servicePackages.reduce((sum, pkg) => sum + (pkg.price || 0), 0);
  const partsCost = customParts.reduce((sum, part) => {
    const quantity = part.quantity || 1;
    const unitPrice = part.unitPrice || 0;
    return sum + (quantity * unitPrice);
  }, 0);

  const totalPartsCost = servicesCost + packagesCost + partsCost;
  const totalCost = (laborCost + totalPartsCost) - discount;

  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    // Insert quotation with status as 'Pending' (isModified removed)
    const [result] = await connection.query(
      `INSERT INTO quotation 
      (serviceRequestId, bookingId, technicianId, customerId, guestName, guestContact, guestEmail, 
        laborCost, partsCost, discount, totalCost, workTimeEstimation, quote, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        serviceRequestId, bookingId, technicianId, customerId, 
        guestName, guestContact, guestEmail,
        laborCost, totalPartsCost, discount, totalCost, 
        workTimeEstimation, quote, status // REMOVED: isModified field
      ]
    );

    const quotationId = result.insertId;

    // Insert services with names and descriptions from services table
    for (const service of services) {
      // Get service details from services table
      const [serviceDetails] = await connection.query(
        "SELECT servicesName, servicesDescription FROM services WHERE servicesId = ?",
        [service.servicesId || service.serviceId]
      );
      
      const serviceDetail = serviceDetails[0];
      
      await connection.query(
        `INSERT INTO quotation_services (quotationId, serviceId, serviceName, serviceDescription, price, quantity) 
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
          quotationId, 
          service.servicesId || service.serviceId,
          serviceDetail?.servicesName || service.serviceName || 'Unknown Service',
          serviceDetail?.servicesDescription || service.serviceDescription || '',
          service.price || 0,
          1 // Default quantity
        ]
      );
    }

    // Insert service packages with names and descriptions from service_packages table
    for (const pkg of servicePackages) {
      // Get package details from service_packages table
      const [packageDetails] = await connection.query(
        "SELECT packageName, packageDescription FROM service_packages WHERE servicePackageId = ?",
        [pkg.servicePackageId || pkg.packageId]
      );
      
      const packageDetail = packageDetails[0];
      
      await connection.query(
        `INSERT INTO quotation_packages (quotationId, servicePackageId, packageName, packageDescription, quantity, price) 
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
          quotationId,
          pkg.servicePackageId || pkg.packageId,
          packageDetail?.packageName || pkg.packageName || 'Unknown Package',
          packageDetail?.packageDescription || pkg.packageDescription || '',
          1, // Default quantity
          pkg.price || 0
        ]
      );
    }

    // Insert custom parts using quotation_parts table
    for (const part of customParts) {
      await connection.query(
        `INSERT INTO quotation_parts (quotationId, partId, quantity, unitPrice) 
        VALUES (?, ?, ?, ?)`,
        [
          quotationId,
          part.partId,
          part.quantity || 1,
          part.unitPrice || 0
        ]
      );
    }

    await connection.commit();
    return getQuotationById(quotationId);

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// Update quotation - UPDATED to remove isModified field
async function updateQuotation(id, quotationData) {
  const {
    technicianId,
    customerId,
    guestName,
    guestContact,
    guestEmail,
    laborCost = 0,
    partsCost = 0,
    discount = 0,
    workTimeEstimation,
    quote,
    status
    // REMOVED: isModified parameter
  } = quotationData;

  // Calculate total cost
  const totalCost = (laborCost + partsCost) - discount;

  await db.query(
    `UPDATE quotation SET 
    technicianId = ?, customerId = ?, guestName = ?, guestContact = ?, guestEmail = ?,
    laborCost = ?, partsCost = ?, discount = ?, totalCost = ?, 
    workTimeEstimation = ?, quote = ?, status = ?, updatedAt = CURRENT_TIMESTAMP
    WHERE quotationId = ?`,
    [
      technicianId, customerId, guestName, guestContact, guestEmail,
      laborCost, partsCost, discount, totalCost, 
      workTimeEstimation, quote, status, id // REMOVED: isModified field
    ]
  );

  return getQuotationById(id);
}

// Delete quotation
async function deleteQuotation(id) {
  // Delete related services, packages, and parts first (due to foreign key constraints)
  await db.query("DELETE FROM quotation_services WHERE quotationId = ?", [id]);
  await db.query("DELETE FROM quotation_packages WHERE quotationId = ?", [id]);
  await db.query("DELETE FROM quotation_parts WHERE quotationId = ?", [id]);
  
  const [result] = await db.query("DELETE FROM quotation WHERE quotationId = ?", [id]);
  return { message: "Quotation deleted successfully" };
}

// Approve quotation - UPDATED to remove isModified field
async function approveQuotation(id) {
  await db.query(
    "UPDATE quotation SET status = 'Approved', approvedAt = CURRENT_TIMESTAMP WHERE quotationId = ?",
    [id]
  );
  return getQuotationById(id);
}

// Reject quotation - UPDATED to remove isModified field
async function rejectQuotation(id) {
  await db.query(
    "UPDATE quotation SET status = 'Rejected' WHERE quotationId = ?",
    [id]
  );
  return getQuotationById(id);
}

// ===============================
// 🔹 QUOTATION SERVICES OPERATIONS
// ===============================

// Add service to quotation - UPDATED to remove isModified field
async function addServiceToQuotation(quotationId, serviceData) {
  const { serviceId, quantity = 1, price = 0 } = serviceData;

  // Get service details from services table
  const [serviceDetails] = await db.query(
    "SELECT servicesName, servicesDescription FROM services WHERE servicesId = ?",
    [serviceId]
  );
  
  const serviceDetail = serviceDetails[0];

  const [result] = await db.query(
    `INSERT INTO quotation_services (quotationId, serviceId, serviceName, serviceDescription, quantity, price) 
    VALUES (?, ?, ?, ?, ?, ?)`,
    [
      quotationId, 
      serviceId,
      serviceDetail?.servicesName || 'Unknown Service',
      serviceDetail?.servicesDescription || '',
      quantity,
      price
    ]
  );

  // Update quotation parts cost (isModified logic removed)
  await updateQuotationCosts(quotationId);

  return { id: result.insertId, quotationId, serviceId, quantity, price };
}

// Get services for quotation
async function getQuotationServices(quotationId) {
  const [rows] = await db.query(`
    SELECT 
      qs.*
    FROM quotation_services qs
    WHERE qs.quotationId = ?
  `, [quotationId]);
  return rows;
}

// Remove service from quotation - UPDATED to remove isModified field
async function removeServiceFromQuotation(quotationId, serviceId) {
  await db.query(
    "DELETE FROM quotation_services WHERE quotationId = ? AND serviceId = ?",
    [quotationId, serviceId]
  );

  // Update quotation parts cost (isModified logic removed)
  await updateQuotationCosts(quotationId);

  return { message: "Service removed from quotation" };
}

// ===============================
// 🔹 QUOTATION PACKAGES OPERATIONS
// ===============================

// Add package to quotation - UPDATED to remove isModified field
async function addPackageToQuotation(quotationId, packageData) {
  const { servicePackageId, quantity = 1, price = 0 } = packageData;

  // Get package details from service_packages table
  const [packageDetails] = await db.query(
    "SELECT packageName, packageDescription FROM service_packages WHERE servicePackageId = ?",
    [servicePackageId]
  );
  
  const packageDetail = packageDetails[0];

  const [result] = await db.query(
    `INSERT INTO quotation_packages (quotationId, servicePackageId, packageName, packageDescription, quantity, price) 
    VALUES (?, ?, ?, ?, ?, ?)`,
    [
      quotationId,
      servicePackageId,
      packageDetail?.packageName || 'Unknown Package',
      packageDetail?.packageDescription || '',
      quantity,
      price
    ]
  );

  // Update quotation parts cost (isModified logic removed)
  await updateQuotationCosts(quotationId);

  return { id: result.insertId, quotationId, servicePackageId, quantity, price };
}

// Get packages for quotation
async function getQuotationPackages(quotationId) {
  const [rows] = await db.query(`
    SELECT 
      qp.*
    FROM quotation_packages qp
    WHERE qp.quotationId = ?
  `, [quotationId]);
  return rows;
}

// Remove package from quotation - UPDATED to remove isModified field
async function removePackageFromQuotation(quotationId, packageId) {
  await db.query(
    "DELETE FROM quotation_packages WHERE quotationId = ? AND servicePackageId = ?",
    [quotationId, packageId]
  );

  // Update quotation parts cost (isModified logic removed)
  await updateQuotationCosts(quotationId);

  return { message: "Package removed from quotation" };
}

// ===============================
// 🔹 QUOTATION PARTS OPERATIONS
// ===============================

// Get parts for quotation
async function getQuotationParts(quotationId) {
  const [rows] = await db.query(`
    SELECT 
      qp.*,
      p.partName,
      p.partDescription
    FROM quotation_parts qp
    JOIN parts p ON qp.partId = p.partId
    WHERE qp.quotationId = ?
  `, [quotationId]);
  return rows;
}

// ===============================
// 🔹 HELPER FUNCTIONS
// ===============================

// Update quotation costs based on services and packages
async function updateQuotationCosts(quotationId) {
  // Calculate total parts cost from services, packages, and parts
  const [servicesCost] = await db.query(`
    SELECT COALESCE(SUM(price * quantity), 0) as total 
    FROM quotation_services 
    WHERE quotationId = ?
  `, [quotationId]);

  const [packagesCost] = await db.query(`
    SELECT COALESCE(SUM(price * quantity), 0) as total 
    FROM quotation_packages 
    WHERE quotationId = ?
  `, [quotationId]);

  const [partsCost] = await db.query(`
    SELECT COALESCE(SUM(unitPrice * quantity), 0) as total 
    FROM quotation_parts 
    WHERE quotationId = ?
  `, [quotationId]);

  const totalPartsCost = servicesCost[0].total + packagesCost[0].total + partsCost[0].total;

  // Get current labor cost and discount
  const quotation = await getQuotationById(quotationId);
  const totalCost = (quotation.laborCost + totalPartsCost) - quotation.discount;

  // Update quotation
  await db.query(
    "UPDATE quotation SET partsCost = ?, totalCost = ? WHERE quotationId = ?",
    [totalPartsCost, totalCost, quotationId]
  );

  return getQuotationById(quotationId);
}

// Get quotations by customer
async function getQuotationsByCustomer(customerId) {
  const [rows] = await db.query(`
    SELECT 
      q.*,
      -- Generate quotation number
      CONCAT('QTN-', LPAD(q.quotationId, 4, '0')) AS quotationNumber,
      -- Fix: Join through users table for technician name
      CONCAT(ut.firstName, ' ', ut.lastName) AS technicianName
    FROM quotation q
    -- Join technicians -> users for technician name
    LEFT JOIN technicians t ON q.technicianId = t.technicianId
    LEFT JOIN users ut ON t.userId = ut.userId
    WHERE q.customerId = ?
    ORDER BY q.createdAt DESC
  `, [customerId]);
  return rows;
}

// Get quotations by technician
async function getQuotationsByTechnician(technicianId) {
  const [rows] = await db.query(`
    SELECT 
      q.*,
      -- Generate quotation number
      CONCAT('QTN-', LPAD(q.quotationId, 4, '0')) AS quotationNumber,
      -- Fix: Join through users table for customer name
      CONCAT(uc.firstName, ' ', uc.lastName) AS customerName
    FROM quotation q
    -- Join customers -> users for customer name
    LEFT JOIN customers c ON q.customerId = c.customerId
    LEFT JOIN users uc ON c.userId = uc.userId
    WHERE q.technicianId = ?
    ORDER BY q.createdAt DESC
  `, [technicianId]);
  return rows;
}

module.exports = {
  getAllQuotations,
  getQuotationById,
  createQuotation,
  updateQuotation,
  deleteQuotation,
  approveQuotation,
  rejectQuotation,
  addServiceToQuotation,
  getQuotationServices,
  removeServiceFromQuotation,
  addPackageToQuotation,
  getQuotationPackages,
  removePackageFromQuotation,
  getQuotationParts,
  getQuotationsByCustomer,
  getQuotationsByTechnician,
};