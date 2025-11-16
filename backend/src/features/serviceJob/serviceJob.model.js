const db = require("../../config/db");

// ===============================
// 🔹 SERVICE JOB CRUD OPERATIONS
// ===============================

// Get all service jobs with related data
async function getAllServiceJobs() {
  const [rows] = await db.query(`
    SELECT 
      sj.serviceJobId,
      sj.quotationId,
      sj.vehicleId,
      sj.jobDescription,
      sj.guestPlateNumber,
      sj.guestBrand,
      sj.guestModel,
      sj.guestYear,
      sj.startDate,
      sj.endDate,
      sj.remarks,
      sj.status,
      sj.createdAt,
      sj.updatedAt,
      
      -- Generate service job number
      CONCAT('SJ-', LPAD(sj.serviceJobId, 4, '0')) AS serviceJobNumber,
      
      -- Quotation details
      q.quotationNumber,
      q.totalCost,
      q.customerName,
      q.customerEmail,
      q.customerPhone,
      q.customerAddress,
      
      -- Vehicle details (if registered vehicle)
      v.plateNumber AS registeredPlateNumber,
      v.brand AS registeredBrand,
      v.model AS registeredModel,
      v.year AS registeredYear,
      
      -- Use guest vehicle details if no registered vehicle
      COALESCE(v.plateNumber, sj.guestPlateNumber) AS displayPlateNumber,
      COALESCE(v.brand, sj.guestBrand) AS displayBrand,
      COALESCE(v.model, sj.guestModel) AS displayModel,
      COALESCE(v.year, sj.guestYear) AS displayYear,
      
      -- Technician assignments
      GROUP_CONCAT(DISTINCT CONCAT(ut.firstName, ' ', ut.lastName) SEPARATOR ', ') AS assignedTechnicians,
      
      -- Work log count
      (SELECT COUNT(*) FROM service_job_worklog wl WHERE wl.serviceJobId = sj.serviceJobId) AS workLogCount

    FROM service_job sj
    
    -- Join quotation
    LEFT JOIN (
      SELECT 
        q.quotationId,
        CONCAT('QTN-', LPAD(q.quotationId, 4, '0')) AS quotationNumber,
        q.totalCost,
        -- Customer details from quotation
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
    ) q ON sj.quotationId = q.quotationId
    
    -- Join vehicle (if registered)
    LEFT JOIN vehicle v ON sj.vehicleId = v.vehicleId
    
    -- Join assigned technicians
    LEFT JOIN service_job_technician sjt ON sj.serviceJobId = sjt.serviceJobId
    LEFT JOIN technicians t ON sjt.technicianId = t.technicianId
    LEFT JOIN users ut ON t.userId = ut.userId
    
    GROUP BY sj.serviceJobId
    ORDER BY sj.createdAt DESC
  `);
  return rows;
}

// Get single service job by ID with all related data
async function getServiceJobById(id) {
  // Get the main service job data
  const [serviceJobRows] = await db.query(`
    SELECT 
      sj.*,
      CONCAT('SJ-', LPAD(sj.serviceJobId, 4, '0')) AS serviceJobNumber,
      
      -- Quotation details with services and packages
      q.quotationNumber,
      q.totalCost,
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
      
      -- Vehicle details
      v.plateNumber AS registeredPlateNumber,
      v.brand AS registeredBrand,
      v.model AS registeredModel,
      v.year AS registeredYear,
      
      -- Display vehicle info (guest or registered)
      COALESCE(v.plateNumber, sj.guestPlateNumber) AS displayPlateNumber,
      COALESCE(v.brand, sj.guestBrand) AS displayBrand,
      COALESCE(v.model, sj.guestModel) AS displayModel,
      COALESCE(v.year, sj.guestYear) AS displayYear

    FROM service_job sj
    
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
    ) q ON sj.quotationId = q.quotationId
    
    -- Join vehicle
    LEFT JOIN vehicle v ON sj.vehicleId = v.vehicleId
    
    WHERE sj.serviceJobId = ?
  `, [id]);

  if (!serviceJobRows[0]) return null;

  const serviceJob = serviceJobRows[0];

  // Get assigned technicians
  const [technicians] = await db.query(`
    SELECT 
      sjt.serviceJobTechnicianId,
      sjt.technicianId,
      sjt.assignedAt,
      CONCAT(u.firstName, ' ', u.lastName) AS technicianName,
      u.email AS technicianEmail,
      u.contactNumber AS technicianPhone
    FROM service_job_technician sjt
    JOIN technicians t ON sjt.technicianId = t.technicianId
    JOIN users u ON t.userId = u.userId
    WHERE sjt.serviceJobId = ?
    ORDER BY sjt.assignedAt DESC
  `, [id]);

  // Get work logs
  const [workLogs] = await db.query(`
    SELECT 
      worklogId,
      workDescription,
      workDate,
      remarks
    FROM service_job_worklog
    WHERE serviceJobId = ?
    ORDER BY workDate DESC
  `, [id]);

  // Get quotation services
  const [services] = await db.query(`
    SELECT 
      qs.*,
      s.servicesName,
      s.servicesDescription
    FROM quotation_services qs
    LEFT JOIN services s ON qs.serviceId = s.servicesId
    WHERE qs.quotationId = ?
  `, [serviceJob.quotationId]);

  // Get quotation packages
  const [servicePackages] = await db.query(`
    SELECT 
      qp.*,
      sp.packageName,
      sp.packageDescription
    FROM quotation_packages qp
    LEFT JOIN service_packages sp ON qp.servicePackageId = sp.servicePackageId
    WHERE qp.quotationId = ?
  `, [serviceJob.quotationId]);

  // Get quotation parts
  const [customParts] = await db.query(`
    SELECT 
      qp.*,
      p.partName,
      p.partDescription
    FROM quotation_parts qp
    LEFT JOIN parts p ON qp.partId = p.partId
    WHERE qp.quotationId = ?
  `, [serviceJob.quotationId]);

  // Combine all data
  return {
    ...serviceJob,
    assignedTechnicians: technicians || [],
    workLogs: workLogs || [],
    services: services || [],
    servicePackages: servicePackages || [],
    customParts: customParts || []
  };
}

// Create new service job
async function createServiceJob(serviceJobData) {
  const {
    quotationId,
    vehicleId,
    jobDescription,
    guestPlateNumber,
    guestBrand,
    guestModel,
    guestYear,
    startDate,
    endDate,
    remarks,
    status = 'Checked In',
    technicianIds = []
  } = serviceJobData;

  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    // Insert service job
    const [result] = await connection.query(
      `INSERT INTO service_job 
      (quotationId, vehicleId, jobDescription, guestPlateNumber, guestBrand, guestModel, guestYear, 
       startDate, endDate, remarks, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        quotationId, vehicleId, jobDescription, 
        guestPlateNumber, guestBrand, guestModel, guestYear,
        startDate, endDate, remarks, status
      ]
    );

    const serviceJobId = result.insertId;

    // Assign technicians if provided
    if (technicianIds.length > 0) {
      for (const technicianId of technicianIds) {
        await connection.query(
          `INSERT INTO service_job_technician (serviceJobId, technicianId)
          VALUES (?, ?)`,
          [serviceJobId, technicianId]
        );
      }
    }

    await connection.commit();
    return getServiceJobById(serviceJobId);

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// Update service job
async function updateServiceJob(id, serviceJobData) {
  const {
    vehicleId,
    jobDescription,
    guestPlateNumber,
    guestBrand,
    guestModel,
    guestYear,
    startDate,
    endDate,
    remarks,
    status
  } = serviceJobData;

  await db.query(
    `UPDATE service_job SET 
    vehicleId = ?, jobDescription = ?, guestPlateNumber = ?, guestBrand = ?, guestModel = ?, guestYear = ?,
    startDate = ?, endDate = ?, remarks = ?, status = ?, updatedAt = CURRENT_TIMESTAMP
    WHERE serviceJobId = ?`,
    [
      vehicleId, jobDescription, guestPlateNumber, guestBrand, guestModel, guestYear,
      startDate, endDate, remarks, status, id
    ]
  );

  return getServiceJobById(id);
}

// Delete service job
async function deleteServiceJob(id) {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    // Delete related records first
    await connection.query("DELETE FROM service_job_worklog WHERE serviceJobId = ?", [id]);
    await connection.query("DELETE FROM service_job_technician WHERE serviceJobId = ?", [id]);
    
    const [result] = await connection.query("DELETE FROM service_job WHERE serviceJobId = ?", [id]);
    
    await connection.commit();
    return { message: "Service job deleted successfully" };

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// ===============================
// 🔹 SERVICE JOB STATUS OPERATIONS
// ===============================

// Update service job status
async function updateServiceJobStatus(id, status) {
  await db.query(
    "UPDATE service_job SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE serviceJobId = ?",
    [status, id]
  );
  return getServiceJobById(id);
}

// ===============================
// 🔹 TECHNICIAN ASSIGNMENT OPERATIONS
// ===============================

// Assign technician to service job
async function assignTechnicianToJob(serviceJobId, technicianId) {
  const [result] = await db.query(
    `INSERT INTO service_job_technician (serviceJobId, technicianId)
    VALUES (?, ?)`,
    [serviceJobId, technicianId]
  );

  return { 
    id: result.insertId, 
    serviceJobId, 
    technicianId,
    assignedAt: new Date()
  };
}

// Remove technician from service job
async function removeTechnicianFromJob(serviceJobId, technicianId) {
  await db.query(
    "DELETE FROM service_job_technician WHERE serviceJobId = ? AND technicianId = ?",
    [serviceJobId, technicianId]
  );

  return { message: "Technician removed from service job" };
}

// Get technicians for service job
async function getServiceJobTechnicians(serviceJobId) {
  const [rows] = await db.query(`
    SELECT 
      sjt.serviceJobTechnicianId,
      sjt.technicianId,
      sjt.assignedAt,
      CONCAT(u.firstName, ' ', u.lastName) AS technicianName,
      u.email,
      u.contactNumber
    FROM service_job_technician sjt
    JOIN technicians t ON sjt.technicianId = t.technicianId
    JOIN users u ON t.userId = u.userId
    WHERE sjt.serviceJobId = ?
    ORDER BY sjt.assignedAt DESC
  `, [serviceJobId]);
  return rows;
}

// ===============================
// 🔹 WORK LOG OPERATIONS
// ===============================

// Add work log to service job
async function addWorkLogToJob(serviceJobId, workLogData) {
  const { workDescription, remarks } = workLogData;

  const [result] = await db.query(
    `INSERT INTO service_job_worklog (serviceJobId, workDescription, remarks)
    VALUES (?, ?, ?)`,
    [serviceJobId, workDescription, remarks]
  );

  return { 
    id: result.insertId, 
    serviceJobId, 
    workDescription, 
    remarks,
    workDate: new Date()
  };
}

// Get work logs for service job
async function getServiceJobWorkLogs(serviceJobId) {
  const [rows] = await db.query(`
    SELECT 
      worklogId,
      workDescription,
      workDate,
      remarks
    FROM service_job_worklog
    WHERE serviceJobId = ?
    ORDER BY workDate DESC
  `, [serviceJobId]);
  return rows;
}

// Update work log
async function updateWorkLog(workLogId, workLogData) {
  const { workDescription, remarks } = workLogData;

  await db.query(
    `UPDATE service_job_worklog SET 
    workDescription = ?, remarks = ?
    WHERE worklogId = ?`,
    [workDescription, remarks, workLogId]
  );

  const [rows] = await db.query(
    "SELECT * FROM service_job_worklog WHERE worklogId = ?",
    [workLogId]
  );
  
  return rows[0] || null;
}

// Delete work log
async function deleteWorkLog(workLogId) {
  await db.query("DELETE FROM service_job_worklog WHERE worklogId = ?", [workLogId]);
  return { message: "Work log deleted successfully" };
}

// ===============================
// 🔹 QUERY OPERATIONS
// ===============================

// Get service jobs by status
async function getServiceJobsByStatus(status) {
  const [rows] = await db.query(`
    SELECT 
      sj.*,
      CONCAT('SJ-', LPAD(sj.serviceJobId, 4, '0')) AS serviceJobNumber,
      q.quotationNumber,
      q.customerName,
      COALESCE(v.plateNumber, sj.guestPlateNumber) AS displayPlateNumber,
      COALESCE(v.brand, sj.guestBrand) AS displayBrand
    FROM service_job sj
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
    ) q ON sj.quotationId = q.quotationId
    LEFT JOIN vehicle v ON sj.vehicleId = v.vehicleId
    WHERE sj.status = ?
    ORDER BY sj.updatedAt DESC
  `, [status]);
  return rows;
}

// Get service jobs by technician
async function getServiceJobsByTechnician(technicianId) {
  const [rows] = await db.query(`
    SELECT 
      sj.*,
      CONCAT('SJ-', LPAD(sj.serviceJobId, 4, '0')) AS serviceJobNumber,
      q.quotationNumber,
      q.customerName,
      COALESCE(v.plateNumber, sj.guestPlateNumber) AS displayPlateNumber,
      sjt.assignedAt
    FROM service_job sj
    JOIN service_job_technician sjt ON sj.serviceJobId = sjt.serviceJobId
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
    ) q ON sj.quotationId = q.quotationId
    LEFT JOIN vehicle v ON sj.vehicleId = v.vehicleId
    WHERE sjt.technicianId = ?
    ORDER BY sjt.assignedAt DESC
  `, [technicianId]);
  return rows;
}

module.exports = {
  getAllServiceJobs,
  getServiceJobById,
  createServiceJob,
  updateServiceJob,
  deleteServiceJob,
  updateServiceJobStatus,
  assignTechnicianToJob,
  removeTechnicianFromJob,
  getServiceJobTechnicians,
  addWorkLogToJob,
  getServiceJobWorkLogs,
  updateWorkLog,
  deleteWorkLog,
  getServiceJobsByStatus,
  getServiceJobsByTechnician
};