const db = require("../../config/db");

// ===============================
// 🔹 QUOTATION CRUD OPERATIONS
// ===============================

// Get all quotations with related data
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
      -- Fix: Join through users table for technician name
      CONCAT(ut.firstName, ' ', ut.lastName) AS technicianName,
      -- Fix: Join through users table for customer name
      CONCAT(uc.firstName, ' ', uc.lastName) AS customerName,
      -- Display guest info if customerId is null
      CASE 
        WHEN q.customerId IS NULL THEN q.guestName
        ELSE CONCAT(uc.firstName, ' ', uc.lastName)
      END AS displayName,
      CASE 
        WHEN q.customerId IS NULL THEN q.guestContact
        ELSE uc.contactNumber
      END AS displayContact
    FROM quotation q
    -- Join technicians -> users for technician name
    LEFT JOIN technicians t ON q.technicianId = t.technicianId
    LEFT JOIN users ut ON t.userId = ut.userId
    -- Join customers -> users for customer name
    LEFT JOIN customers c ON q.customerId = c.customerId
    LEFT JOIN users uc ON c.userId = uc.userId
    ORDER BY q.createdAt DESC
  `);
  return rows;
}

// Get single quotation by ID
async function getQuotationById(id) {
  const [rows] = await db.query(`
    SELECT 
      q.*,
      -- Fix: Join through users table for technician name
      CONCAT(ut.firstName, ' ', ut.lastName) AS technicianName,
      -- Fix: Join through users table for customer name
      CONCAT(uc.firstName, ' ', uc.lastName) AS customerName,
      -- Display guest info if customerId is null
      CASE 
        WHEN q.customerId IS NULL THEN q.guestName
        ELSE CONCAT(uc.firstName, ' ', uc.lastName)
      END AS displayName,
      CASE 
        WHEN q.customerId IS NULL THEN q.guestContact
        ELSE uc.contactNumber
      END AS displayContact,
      CASE 
        WHEN q.customerId IS NULL THEN q.guestEmail
        ELSE uc.email
      END AS displayEmail
    FROM quotation q
    -- Join technicians -> users for technician name
    LEFT JOIN technicians t ON q.technicianId = t.technicianId
    LEFT JOIN users ut ON t.userId = ut.userId
    -- Join customers -> users for customer name
    LEFT JOIN customers c ON q.customerId = c.customerId
    LEFT JOIN users uc ON c.userId = uc.userId
    WHERE q.quotationId = ?
  `, [id]);
  return rows[0];
}

// Create new quotation
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
    partsCost = 0,
    discount = 0,
    workTimeEstimation,
    quote,
    status = 'Pending'
  } = quotationData;

  // Calculate total cost
  const totalCost = (laborCost + partsCost) - discount;

  const [result] = await db.query(
    `INSERT INTO quotation 
     (serviceRequestId, bookingId, technicianId, customerId, guestName, guestContact, guestEmail, 
      laborCost, partsCost, discount, totalCost, workTimeEstimation, quote, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      serviceRequestId, bookingId, technicianId, customerId, 
      guestName, guestContact, guestEmail,
      laborCost, partsCost, discount, totalCost, 
      workTimeEstimation, quote, status
    ]
  );

  return getQuotationById(result.insertId);
}

// Update quotation
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
      workTimeEstimation, quote, status, id
    ]
  );

  return getQuotationById(id);
}

// Delete quotation
async function deleteQuotation(id) {
  // Delete related services and packages first (due to foreign key constraints)
  await db.query("DELETE FROM quotation_services WHERE quotationId = ?", [id]);
  await db.query("DELETE FROM quotation_packages WHERE quotationId = ?", [id]);
  
  const [result] = await db.query("DELETE FROM quotation WHERE quotationId = ?", [id]);
  return { message: "Quotation deleted successfully" };
}

// Approve quotation
async function approveQuotation(id) {
  await db.query(
    "UPDATE quotation SET status = 'Approved', approvedAt = CURRENT_TIMESTAMP WHERE quotationId = ?",
    [id]
  );
  return getQuotationById(id);
}

// Reject quotation
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

// Add service to quotation
async function addServiceToQuotation(quotationId, serviceData) {
  const { serviceId, quantity = 1, price = 0 } = serviceData;

  const [result] = await db.query(
    "INSERT INTO quotation_services (quotationId, serviceId, quantity, price) VALUES (?, ?, ?, ?)",
    [quotationId, serviceId, quantity, price]
  );

  // Update quotation parts cost
  await updateQuotationCosts(quotationId);

  return { id: result.insertId, quotationId, serviceId, quantity, price };
}

// Get services for quotation
async function getQuotationServices(quotationId) {
  const [rows] = await db.query(`
    SELECT 
      qs.*,
      s.serviceName,
      s.serviceDescription,
      s.estimatedTime,
      s.category
    FROM quotation_services qs
    JOIN services s ON qs.serviceId = s.servicesId
    WHERE qs.quotationId = ?
  `, [quotationId]);
  return rows;
}

// Remove service from quotation
async function removeServiceFromQuotation(quotationId, serviceId) {
  await db.query(
    "DELETE FROM quotation_services WHERE quotationId = ? AND serviceId = ?",
    [quotationId, serviceId]
  );

  // Update quotation parts cost
  await updateQuotationCosts(quotationId);

  return { message: "Service removed from quotation" };
}

// ===============================
// 🔹 QUOTATION PACKAGES OPERATIONS
// ===============================

// Add package to quotation
async function addPackageToQuotation(quotationId, packageData) {
  const { servicePackageId, quantity = 1, price = 0 } = packageData;

  const [result] = await db.query(
    "INSERT INTO quotation_packages (quotationId, servicePackageId, quantity, price) VALUES (?, ?, ?, ?)",
    [quotationId, servicePackageId, quantity, price]
  );

  // Update quotation parts cost
  await updateQuotationCosts(quotationId);

  return { id: result.insertId, quotationId, servicePackageId, quantity, price };
}

// Get packages for quotation
async function getQuotationPackages(quotationId) {
  const [rows] = await db.query(`
    SELECT 
      qp.*,
      sp.packageName,
      sp.packageDescription,
      sp.servicesIncluded,
      sp.estimatedTime
    FROM quotation_packages qp
    JOIN service_packages sp ON qp.servicePackageId = sp.servicePackageId
    WHERE qp.quotationId = ?
  `, [quotationId]);
  return rows;
}

// Remove package from quotation
async function removePackageFromQuotation(quotationId, packageId) {
  await db.query(
    "DELETE FROM quotation_packages WHERE quotationId = ? AND servicePackageId = ?",
    [quotationId, packageId]
  );

  // Update quotation parts cost
  await updateQuotationCosts(quotationId);

  return { message: "Package removed from quotation" };
}

// ===============================
// 🔹 HELPER FUNCTIONS
// ===============================

// Update quotation costs based on services and packages
async function updateQuotationCosts(quotationId) {
  // Calculate total parts cost from services and packages
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

  const totalPartsCost = servicesCost[0].total + packagesCost[0].total;

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
  getQuotationsByCustomer,
  getQuotationsByTechnician,
};

// const db = require("../../config/db");

// // ===============================
// // 🔹 QUOTATION CRUD OPERATIONS
// // ===============================

// // Get all quotations with related data
// async function getAllQuotations() {
//   const [rows] = await db.query(`
//     SELECT 
//       q.quotationId,
//       q.serviceRequestId,
//       q.bookingId,
//       q.technicianId,
//       q.customerId,
//       q.guestName,
//       q.guestContact,
//       q.guestEmail,
//       q.laborCost,
//       q.partsCost,
//       q.discount,
//       q.totalCost,
//       q.workTimeEstimation,
//       q.quote,
//       q.status,
//       q.createdAt,
//       q.updatedAt,
//       q.approvedAt,
//       CONCAT(t.firstName, ' ', t.lastName) AS technicianName,
//       CONCAT(c.firstName, ' ', c.lastName) AS customerName,
//       sr.vehicleNumber AS serviceRequestVehicle,
//       b.vehicleNumber AS bookingVehicle,
//       -- Display guest info if customerId is null
//       CASE 
//         WHEN q.customerId IS NULL THEN q.guestName
//         ELSE CONCAT(c.firstName, ' ', c.lastName)
//       END AS displayName,
//       CASE 
//         WHEN q.customerId IS NULL THEN q.guestContact
//         ELSE c.contactNumber
//       END AS displayContact
//     FROM quotation q
//     LEFT JOIN technicians t ON q.technicianId = t.technicianId
//     LEFT JOIN customers c ON q.customerId = c.customerId
//     LEFT JOIN serviceRequestBooking sr ON q.serviceRequestId = sr.serviceRequestId
//     LEFT JOIN booking b ON q.bookingId = b.bookingId
//     ORDER BY q.createdAt DESC
//   `);
//   return rows;
// }

// // Get single quotation by ID
// async function getQuotationById(id) {
//   const [rows] = await db.query(`
//     SELECT 
//       q.*,
//       CONCAT(t.firstName, ' ', t.lastName) AS technicianName,
//       CONCAT(c.firstName, ' ', c.lastName) AS customerName,
//       sr.vehicleNumber AS serviceRequestVehicle,
//       b.vehicleNumber AS bookingVehicle,
//       -- Display guest info if customerId is null
//       CASE 
//         WHEN q.customerId IS NULL THEN q.guestName
//         ELSE CONCAT(c.firstName, ' ', c.lastName)
//       END AS displayName,
//       CASE 
//         WHEN q.customerId IS NULL THEN q.guestContact
//         ELSE c.contactNumber
//       END AS displayContact,
//       CASE 
//         WHEN q.customerId IS NULL THEN q.guestEmail
//         ELSE c.email
//       END AS displayEmail
//     FROM quotation q
//     LEFT JOIN technicians t ON q.technicianId = t.technicianId
//     LEFT JOIN customers c ON q.customerId = c.customerId
//     LEFT JOIN serviceRequestBooking sr ON q.serviceRequestId = sr.serviceRequestId
//     LEFT JOIN booking b ON q.bookingId = b.bookingId
//     WHERE q.quotationId = ?
//   `, [id]);
//   return rows[0];
// }

// // Create new quotation
// async function createQuotation(quotationData) {
//   const {
//     serviceRequestId,
//     bookingId,
//     technicianId,
//     customerId,
//     guestName,
//     guestContact,
//     guestEmail,
//     laborCost = 0,
//     partsCost = 0,
//     discount = 0,
//     workTimeEstimation,
//     quote,
//     status = 'Pending'
//   } = quotationData;

//   // Calculate total cost
//   const totalCost = (laborCost + partsCost) - discount;

//   const [result] = await db.query(
//     `INSERT INTO quotation 
//      (serviceRequestId, bookingId, technicianId, customerId, guestName, guestContact, guestEmail, 
//       laborCost, partsCost, discount, totalCost, workTimeEstimation, quote, status)
//      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//     [
//       serviceRequestId, bookingId, technicianId, customerId, 
//       guestName, guestContact, guestEmail,
//       laborCost, partsCost, discount, totalCost, 
//       workTimeEstimation, quote, status
//     ]
//   );

//   return getQuotationById(result.insertId);
// }

// // Update quotation
// async function updateQuotation(id, quotationData) {
//   const {
//     technicianId,
//     customerId,
//     guestName,
//     guestContact,
//     guestEmail,
//     laborCost = 0,
//     partsCost = 0,
//     discount = 0,
//     workTimeEstimation,
//     quote,
//     status
//   } = quotationData;

//   // Calculate total cost
//   const totalCost = (laborCost + partsCost) - discount;

//   await db.query(
//     `UPDATE quotation SET 
//      technicianId = ?, customerId = ?, guestName = ?, guestContact = ?, guestEmail = ?,
//      laborCost = ?, partsCost = ?, discount = ?, totalCost = ?, 
//      workTimeEstimation = ?, quote = ?, status = ?, updatedAt = CURRENT_TIMESTAMP
//      WHERE quotationId = ?`,
//     [
//       technicianId, customerId, guestName, guestContact, guestEmail,
//       laborCost, partsCost, discount, totalCost, 
//       workTimeEstimation, quote, status, id
//     ]
//   );

//   return getQuotationById(id);
// }

// // Delete quotation
// async function deleteQuotation(id) {
//   // Delete related services and packages first (due to foreign key constraints)
//   await db.query("DELETE FROM quotation_services WHERE quotationId = ?", [id]);
//   await db.query("DELETE FROM quotation_packages WHERE quotationId = ?", [id]);
  
//   const [result] = await db.query("DELETE FROM quotation WHERE quotationId = ?", [id]);
//   return { message: "Quotation deleted successfully" };
// }

// // Approve quotation
// async function approveQuotation(id) {
//   await db.query(
//     "UPDATE quotation SET status = 'Approved', approvedAt = CURRENT_TIMESTAMP WHERE quotationId = ?",
//     [id]
//   );
//   return getQuotationById(id);
// }

// // Reject quotation
// async function rejectQuotation(id) {
//   await db.query(
//     "UPDATE quotation SET status = 'Rejected' WHERE quotationId = ?",
//     [id]
//   );
//   return getQuotationById(id);
// }

// // ===============================
// // 🔹 QUOTATION SERVICES OPERATIONS
// // ===============================

// // Add service to quotation
// async function addServiceToQuotation(quotationId, serviceData) {
//   const { serviceId, quantity = 1, price = 0 } = serviceData;

//   const [result] = await db.query(
//     "INSERT INTO quotation_services (quotationId, serviceId, quantity, price) VALUES (?, ?, ?, ?)",
//     [quotationId, serviceId, quantity, price]
//   );

//   // Update quotation parts cost
//   await updateQuotationCosts(quotationId);

//   return { id: result.insertId, quotationId, serviceId, quantity, price };
// }

// // Get services for quotation
// async function getQuotationServices(quotationId) {
//   const [rows] = await db.query(`
//     SELECT 
//       qs.*,
//       s.serviceName,
//       s.serviceDescription,
//       s.estimatedTime,
//       s.category
//     FROM quotation_services qs
//     JOIN services s ON qs.serviceId = s.servicesId
//     WHERE qs.quotationId = ?
//   `, [quotationId]);
//   return rows;
// }

// // Remove service from quotation
// async function removeServiceFromQuotation(quotationId, serviceId) {
//   await db.query(
//     "DELETE FROM quotation_services WHERE quotationId = ? AND serviceId = ?",
//     [quotationId, serviceId]
//   );

//   // Update quotation parts cost
//   await updateQuotationCosts(quotationId);

//   return { message: "Service removed from quotation" };
// }

// // ===============================
// // 🔹 QUOTATION PACKAGES OPERATIONS
// // ===============================

// // Add package to quotation
// async function addPackageToQuotation(quotationId, packageData) {
//   const { servicePackageId, quantity = 1, price = 0 } = packageData;

//   const [result] = await db.query(
//     "INSERT INTO quotation_packages (quotationId, servicePackageId, quantity, price) VALUES (?, ?, ?, ?)",
//     [quotationId, servicePackageId, quantity, price]
//   );

//   // Update quotation parts cost
//   await updateQuotationCosts(quotationId);

//   return { id: result.insertId, quotationId, servicePackageId, quantity, price };
// }

// // Get packages for quotation
// async function getQuotationPackages(quotationId) {
//   const [rows] = await db.query(`
//     SELECT 
//       qp.*,
//       sp.packageName,
//       sp.packageDescription,
//       sp.servicesIncluded,
//       sp.estimatedTime
//     FROM quotation_packages qp
//     JOIN service_packages sp ON qp.servicePackageId = sp.servicePackageId
//     WHERE qp.quotationId = ?
//   `, [quotationId]);
//   return rows;
// }

// // Remove package from quotation
// async function removePackageFromQuotation(quotationId, packageId) {
//   await db.query(
//     "DELETE FROM quotation_packages WHERE quotationId = ? AND servicePackageId = ?",
//     [quotationId, packageId]
//   );

//   // Update quotation parts cost
//   await updateQuotationCosts(quotationId);

//   return { message: "Package removed from quotation" };
// }

// // ===============================
// // 🔹 HELPER FUNCTIONS
// // ===============================

// // Update quotation costs based on services and packages
// async function updateQuotationCosts(quotationId) {
//   // Calculate total parts cost from services and packages
//   const [servicesCost] = await db.query(`
//     SELECT COALESCE(SUM(price * quantity), 0) as total 
//     FROM quotation_services 
//     WHERE quotationId = ?
//   `, [quotationId]);

//   const [packagesCost] = await db.query(`
//     SELECT COALESCE(SUM(price * quantity), 0) as total 
//     FROM quotation_packages 
//     WHERE quotationId = ?
//   `, [quotationId]);

//   const totalPartsCost = servicesCost[0].total + packagesCost[0].total;

//   // Get current labor cost and discount
//   const quotation = await getQuotationById(quotationId);
//   const totalCost = (quotation.laborCost + totalPartsCost) - quotation.discount;

//   // Update quotation
//   await db.query(
//     "UPDATE quotation SET partsCost = ?, totalCost = ? WHERE quotationId = ?",
//     [totalPartsCost, totalCost, quotationId]
//   );

//   return getQuotationById(quotationId);
// }

// // Get quotations by customer
// async function getQuotationsByCustomer(customerId) {
//   const [rows] = await db.query(`
//     SELECT 
//       q.*,
//       CONCAT(t.firstName, ' ', t.lastName) AS technicianName,
//       sr.vehicleNumber AS serviceRequestVehicle,
//       b.vehicleNumber AS bookingVehicle
//     FROM quotation q
//     LEFT JOIN technicians t ON q.technicianId = t.technicianId
//     LEFT JOIN serviceRequestBooking sr ON q.serviceRequestId = sr.serviceRequestId
//     LEFT JOIN booking b ON q.bookingId = b.bookingId
//     WHERE q.customerId = ?
//     ORDER BY q.createdAt DESC
//   `, [customerId]);
//   return rows;
// }

// // Get quotations by technician
// async function getQuotationsByTechnician(technicianId) {
//   const [rows] = await db.query(`
//     SELECT 
//       q.*,
//       CONCAT(c.firstName, ' ', c.lastName) AS customerName,
//       sr.vehicleNumber AS serviceRequestVehicle,
//       b.vehicleNumber AS bookingVehicle
//     FROM quotation q
//     LEFT JOIN customers c ON q.customerId = c.customerId
//     LEFT JOIN serviceRequestBooking sr ON q.serviceRequestId = sr.serviceRequestId
//     LEFT JOIN booking b ON q.bookingId = b.bookingId
//     WHERE q.technicianId = ?
//     ORDER BY q.createdAt DESC
//   `, [technicianId]);
//   return rows;
// }

// module.exports = {
//   getAllQuotations,
//   getQuotationById,
//   createQuotation,
//   updateQuotation,
//   deleteQuotation,
//   approveQuotation,
//   rejectQuotation,
//   addServiceToQuotation,
//   getQuotationServices,
//   removeServiceFromQuotation,
//   addPackageToQuotation,
//   getQuotationPackages,
//   removePackageFromQuotation,
//   getQuotationsByCustomer,
//   getQuotationsByTechnician,
// };