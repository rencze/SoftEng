const db = require("../../config/db");

// ===============================
// 🔹 SERVICE JOB CRUD OPERATIONS
// ===============================

async function getAllServiceJobs() {
  const [rows] = await db.query(`
    SELECT 
      sj.serviceJobId as id,
      CONCAT('SJ-', LPAD(sj.serviceJobId, 4, '0')) as jobNumber,
      
      -- Customer details
      q.customerName,
      q.customerPhone,
      q.customerEmail,
      q.customerAddress as address,
      
      -- Service types from quotation services
      sj.jobDescription as description,
      sj.status,
      DATE(sj.createdAt) as createdAt,
      sj.startDate as scheduledDate,
      sj.remarks as notes,
      q.workTimeEstimation as estimatedDuration,
      
      -- Vehicle info
      COALESCE(v.plateNumber, sj.guestPlateNumber) as vehiclePlate,
      COALESCE(v.brand, sj.guestBrand) as vehicleBrand,
      COALESCE(v.model, sj.guestModel) as vehicleModel,
      
      -- Quotation reference
      q.quotationNumber,
      q.quotationDate,
      q.validUntil,
      q.totalCost as totalAmount,
      q.quoteStatus as status,
      q.notes as quotationNotes

    FROM service_job sj
    LEFT JOIN (
      SELECT 
        q.quotationId,
        CONCAT('QTN-', LPAD(q.quotationId, 4, '0')) as quotationNumber,
        q.totalCost,
        q.workTimeEstimation,
        q.createdAt as quotationDate,
        DATE_ADD(q.createdAt, INTERVAL 30 DAY) as validUntil,
        'Approved' as quoteStatus,
        q.notes as quotationNotes,
        CASE 
          WHEN q.serviceRequestId IS NOT NULL THEN CONCAT(sr_cu.firstName, ' ', sr_cu.lastName)
          WHEN q.customerId IS NOT NULL THEN CONCAT(uc.firstName, ' ', uc.lastName)
          ELSE q.guestName
        END AS customerName,
        CASE 
          WHEN q.serviceRequestId IS NOT NULL THEN sr_cu.contactNumber
          WHEN q.customerId IS NOT NULL THEN uc.contactNumber
          ELSE q.guestContact
        END AS customerPhone,
        CASE 
          WHEN q.serviceRequestId IS NOT NULL THEN sr_cu.email
          WHEN q.customerId IS NOT NULL THEN uc.email
          ELSE q.guestEmail
        END AS customerEmail,
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
    LEFT JOIN vehicle v ON sj.vehicleId = v.vehicleId
  `);

  // Get service types for each job
  const enhancedRows = await Promise.all(rows.map(async (row) => {
    // Get service types from quotation services
    const [serviceTypes] = await db.query(`
      SELECT DISTINCT s.servicesName
      FROM quotation_services qs
      JOIN services s ON qs.serviceId = s.servicesId
      WHERE qs.quotationId = (
        SELECT quotationId FROM service_job WHERE serviceJobId = ?
      )
      UNION
      SELECT DISTINCT sp.packageName as servicesName
      FROM quotation_packages qp
      JOIN service_packages sp ON qp.servicePackageId = sp.servicePackageId
      WHERE qp.quotationId = (
        SELECT quotationId FROM service_job WHERE serviceJobId = ?
      )
    `, [row.id, row.id]);

    // Get assigned technicians
    const [technicians] = await db.query(`
      SELECT CONCAT(u.firstName, ' ', u.lastName) as technicianName
      FROM service_job_technician sjt
      JOIN technicians t ON sjt.technicianId = t.technicianId
      JOIN users u ON t.userId = u.userId
      WHERE sjt.serviceJobId = ?
    `, [row.id]);

    // Get work logs
    const [workLogs] = await db.query(`
      SELECT 
        worklogId as id,
        DATE(workDate) as date,
        DATE_FORMAT(workDate, '%h:%i %p') as time,
        workDescription as action,
        COALESCE(CONCAT(u.firstName, ' ', u.lastName), 'System') as technician,
        remarks as notes
      FROM service_job_worklog wl
      LEFT JOIN technicians t ON wl.technicianId = t.technicianId
      LEFT JOIN users u ON t.userId = u.userId
      WHERE wl.serviceJobId = ?
      ORDER BY workDate ASC
    `, [row.id]);

    // Get quotation items
    const [quotationItems] = await db.query(`
      SELECT 
        s.servicesName as name,
        s.servicesDescription as description,
        1 as quantity,
        qs.cost as unitPrice,
        qs.cost as total
      FROM quotation_services qs
      JOIN services s ON qs.serviceId = s.servicesId
      WHERE qs.quotationId = (
        SELECT quotationId FROM service_job WHERE serviceJobId = ?
      )
      UNION ALL
      SELECT 
        sp.packageName as name,
        sp.packageDescription as description,
        1 as quantity,
        qp.cost as unitPrice,
        qp.cost as total
      FROM quotation_packages qp
      JOIN service_packages sp ON qp.servicePackageId = sp.servicePackageId
      WHERE qp.quotationId = (
        SELECT quotationId FROM service_job WHERE serviceJobId = ?
      )
      UNION ALL
      SELECT 
        p.partName as name,
        p.partDescription as description,
        qp.quantity,
        qp.cost as unitPrice,
        (qp.quantity * qp.cost) as total
      FROM quotation_parts qp
      JOIN parts p ON qp.partId = p.partId
      WHERE qp.quotationId = (
        SELECT quotationId FROM service_job WHERE serviceJobId = ?
      )
    `, [row.id, row.id, row.id]);

    return {
      ...row,
      serviceType: serviceTypes.map(st => st.servicesName),
      assignedTechnicians: technicians.map(t => t.technicianName),
      workLog: workLogs,
      referenceQuotation: {
        quotationNumber: row.quotationNumber,
        quotationDate: row.quotationDate?.toISOString().split('T')[0],
        validUntil: row.validUntil?.toISOString().split('T')[0],
        totalAmount: row.totalAmount,
        status: row.status,
        items: quotationItems,
        notes: row.quotationNotes
      }
    };
  }));

  return enhancedRows;
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

  // Get work logs with formatted date/time
  const [workLogs] = await db.query(`
    SELECT 
      worklogId,
      workDescription,
      workDate,
      DATE_FORMAT(workDate, '%Y-%m-%d') AS formattedDate,
      DATE_FORMAT(workDate, '%h:%i %p') AS formattedTime,
      remarks,
      technicianId,
      CONCAT(u.firstName, ' ', u.lastName) AS technicianName
    FROM service_job_worklog wl
    LEFT JOIN technicians t ON wl.technicianId = t.technicianId
    LEFT JOIN users u ON t.userId = u.userId
    WHERE wl.serviceJobId = ?
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

    // Add initial work log entry
    await connection.query(
      `INSERT INTO service_job_worklog (serviceJobId, workDescription, remarks)
      VALUES (?, 'Job Created', 'New service job created')`,
      [serviceJobId]
    );

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
async function updateServiceJobStatus(id, status, notes = "") {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    // Update status
    await connection.query(
      "UPDATE service_job SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE serviceJobId = ?",
      [status, id]
    );

    // Add work log entry for status change
    await connection.query(
      `INSERT INTO service_job_worklog (serviceJobId, workDescription, remarks)
      VALUES (?, ?, ?)`,
      [id, `Status Updated to ${status}`, notes || `Status changed to ${status}`]
    );

    await connection.commit();
    return getServiceJobById(id);

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// ===============================
// 🔹 TECHNICIAN ASSIGNMENT OPERATIONS
// ===============================

// Assign technician to service job
async function assignTechnicianToJob(serviceJobId, technicianId) {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    // Check if already assigned
    const [existing] = await connection.query(
      "SELECT * FROM service_job_technician WHERE serviceJobId = ? AND technicianId = ?",
      [serviceJobId, technicianId]
    );

    if (existing.length > 0) {
      throw new Error("Technician already assigned to this job");
    }

    // Assign technician
    const [result] = await connection.query(
      `INSERT INTO service_job_technician (serviceJobId, technicianId)
      VALUES (?, ?)`,
      [serviceJobId, technicianId]
    );

    // Get technician name for work log
    const [tech] = await connection.query(`
      SELECT CONCAT(u.firstName, ' ', u.lastName) AS technicianName
      FROM technicians t
      JOIN users u ON t.userId = u.userId
      WHERE t.technicianId = ?
    `, [technicianId]);

    const technicianName = tech[0]?.technicianName || 'Unknown Technician';

    // Add work log entry
    await connection.query(
      `INSERT INTO service_job_worklog (serviceJobId, workDescription, remarks, technicianId)
      VALUES (?, 'Technician Assigned', ?, ?)`,
      [serviceJobId, `Technician ${technicianName} assigned to job`, technicianId]
    );

    await connection.commit();

    return { 
      id: result.insertId, 
      serviceJobId, 
      technicianId,
      assignedAt: new Date()
    };

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// Remove technician from service job
async function removeTechnicianFromJob(serviceJobId, technicianId) {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    // Get technician name before removal
    const [tech] = await connection.query(`
      SELECT CONCAT(u.firstName, ' ', u.lastName) AS technicianName
      FROM technicians t
      JOIN users u ON t.userId = u.userId
      WHERE t.technicianId = ?
    `, [technicianId]);

    const technicianName = tech[0]?.technicianName || 'Unknown Technician';

    // Remove technician
    await connection.query(
      "DELETE FROM service_job_technician WHERE serviceJobId = ? AND technicianId = ?",
      [serviceJobId, technicianId]
    );

    // Add work log entry
    await connection.query(
      `INSERT INTO service_job_worklog (serviceJobId, workDescription, remarks)
      VALUES (?, 'Technician Removed', ?)`,
      [serviceJobId, `Technician ${technicianName} removed from job`]
    );

    await connection.commit();

    return { message: "Technician removed from service job" };

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
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
  const { workDescription, remarks, technicianId = null } = workLogData;

  const [result] = await db.query(
    `INSERT INTO service_job_worklog (serviceJobId, workDescription, remarks, technicianId)
    VALUES (?, ?, ?, ?)`,
    [serviceJobId, workDescription, remarks, technicianId]
  );

  return { 
    id: result.insertId, 
    serviceJobId, 
    workDescription, 
    remarks,
    technicianId,
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
      DATE_FORMAT(workDate, '%Y-%m-%d') AS formattedDate,
      DATE_FORMAT(workDate, '%h:%i %p') AS formattedTime,
      remarks,
      technicianId,
      CONCAT(u.firstName, ' ', u.lastName) AS technicianName
    FROM service_job_worklog wl
    LEFT JOIN technicians t ON wl.technicianId = t.technicianId
    LEFT JOIN users u ON t.userId = u.userId
    WHERE wl.serviceJobId = ?
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

  const [rows] = await db.query(`
    SELECT 
      worklogId,
      workDescription,
      workDate,
      DATE_FORMAT(workDate, '%Y-%m-%d') AS formattedDate,
      DATE_FORMAT(workDate, '%h:%i %p') AS formattedTime,
      remarks,
      technicianId,
      CONCAT(u.firstName, ' ', u.lastName) AS technicianName
    FROM service_job_worklog wl
    LEFT JOIN technicians t ON wl.technicianId = t.technicianId
    LEFT JOIN users u ON t.userId = u.userId
    WHERE wl.worklogId = ?
  `, [workLogId]);
  
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
      q.customerEmail,
      q.customerPhone,
      q.workTimeEstimation,
      COALESCE(v.plateNumber, sj.guestPlateNumber) AS displayPlateNumber,
      COALESCE(v.brand, sj.guestBrand) AS displayBrand,
      GROUP_CONCAT(DISTINCT CONCAT(ut.firstName, ' ', ut.lastName) SEPARATOR ', ') AS assignedTechnicians
    FROM service_job sj
    LEFT JOIN (
      SELECT 
        quotationId,
        CONCAT('QTN-', LPAD(quotationId, 4, '0')) AS quotationNumber,
        CASE 
          WHEN serviceRequestId IS NOT NULL THEN CONCAT(sr_cu.firstName, ' ', sr_cu.lastName)
          WHEN customerId IS NOT NULL THEN CONCAT(uc.firstName, ' ', uc.lastName)
          ELSE guestName
        END AS customerName,
        CASE 
          WHEN serviceRequestId IS NOT NULL THEN sr_cu.email
          WHEN customerId IS NOT NULL THEN uc.email
          ELSE q.guestEmail
        END AS customerEmail,
        CASE 
          WHEN serviceRequestId IS NOT NULL THEN sr_cu.contactNumber
          WHEN customerId IS NOT NULL THEN uc.contactNumber
          ELSE q.guestContact
        END AS customerPhone,
        q.workTimeEstimation
      FROM quotation q
      LEFT JOIN serviceRequestBooking srb ON q.serviceRequestId = srb.serviceRequestId
      LEFT JOIN customers sr_c ON srb.customerId = sr_c.customerId
      LEFT JOIN users sr_cu ON sr_c.userId = sr_cu.userId
      LEFT JOIN customers c ON q.customerId = c.customerId
      LEFT JOIN users uc ON c.userId = uc.userId
    ) q ON sj.quotationId = q.quotationId
    LEFT JOIN vehicle v ON sj.vehicleId = v.vehicleId
    LEFT JOIN service_job_technician sjt ON sj.serviceJobId = sjt.serviceJobId
    LEFT JOIN technicians t ON sjt.technicianId = t.technicianId
    LEFT JOIN users ut ON t.userId = ut.userId
    WHERE sj.status = ?
    GROUP BY sj.serviceJobId
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
      q.workTimeEstimation,
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
        END AS customerName,
        q.workTimeEstimation
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

// Search service jobs
async function searchServiceJobs(searchTerm, statusFilter = 'All') {
  let query = `
    SELECT 
      sj.*,
      CONCAT('SJ-', LPAD(sj.serviceJobId, 4, '0')) AS serviceJobNumber,
      q.quotationNumber,
      q.customerName,
      q.customerEmail,
      q.customerPhone,
      q.customerAddress,
      q.workTimeEstimation,
      COALESCE(v.plateNumber, sj.guestPlateNumber) AS displayPlateNumber,
      COALESCE(v.brand, sj.guestBrand) AS displayBrand,
      COALESCE(v.model, sj.guestModel) AS displayModel,
      GROUP_CONCAT(DISTINCT CONCAT(ut.firstName, ' ', ut.lastName) SEPARATOR ', ') AS assignedTechnicians
    FROM service_job sj
    LEFT JOIN (
      SELECT 
        quotationId,
        CONCAT('QTN-', LPAD(quotationId, 4, '0')) AS quotationNumber,
        CASE 
          WHEN serviceRequestId IS NOT NULL THEN CONCAT(sr_cu.firstName, ' ', sr_cu.lastName)
          WHEN customerId IS NOT NULL THEN CONCAT(uc.firstName, ' ', uc.lastName)
          ELSE guestName
        END AS customerName,
        CASE 
          WHEN serviceRequestId IS NOT NULL THEN sr_cu.email
          WHEN customerId IS NOT NULL THEN uc.email
          ELSE q.guestEmail
        END AS customerEmail,
        CASE 
          WHEN serviceRequestId IS NOT NULL THEN sr_cu.contactNumber
          WHEN customerId IS NOT NULL THEN uc.contactNumber
          ELSE q.guestContact
        END AS customerPhone,
        CASE 
          WHEN serviceRequestId IS NOT NULL THEN sr_cu.address
          WHEN customerId IS NOT NULL THEN uc.address
          ELSE NULL
        END AS customerAddress,
        q.workTimeEstimation
      FROM quotation q
      LEFT JOIN serviceRequestBooking srb ON q.serviceRequestId = srb.serviceRequestId
      LEFT JOIN customers sr_c ON srb.customerId = sr_c.customerId
      LEFT JOIN users sr_cu ON sr_c.userId = sr_cu.userId
      LEFT JOIN customers c ON q.customerId = c.customerId
      LEFT JOIN users uc ON c.userId = uc.userId
    ) q ON sj.quotationId = q.quotationId
    LEFT JOIN vehicle v ON sj.vehicleId = v.vehicleId
    LEFT JOIN service_job_technician sjt ON sj.serviceJobId = sjt.serviceJobId
    LEFT JOIN technicians t ON sjt.technicianId = t.technicianId
    LEFT JOIN users ut ON t.userId = ut.userId
    WHERE 1=1
  `;

  const params = [];

  if (searchTerm) {
    query += ` AND (
      q.customerName LIKE ? OR 
      sj.serviceJobNumber LIKE ? OR
      q.customerEmail LIKE ? OR
      q.customerPhone LIKE ? OR
      q.customerAddress LIKE ? OR
      COALESCE(v.plateNumber, sj.guestPlateNumber) LIKE ? OR
      COALESCE(v.brand, sj.guestBrand) LIKE ?
    )`;
    const searchParam = `%${searchTerm}%`;
    params.push(
      searchParam, searchParam, searchParam, searchParam, 
      searchParam, searchParam, searchParam
    );
  }

  if (statusFilter !== 'All') {
    query += ` AND sj.status = ?`;
    params.push(statusFilter);
  }

  query += ` GROUP BY sj.serviceJobId ORDER BY sj.createdAt DESC`;

  const [rows] = await db.query(query, params);
  return rows;
}

// Get service job summary counts
async function getServiceJobSummary() {
  const [rows] = await db.query(`
    SELECT 
      COUNT(*) as total,
      SUM(sj.status = 'Checked In') as checkedIn,
      SUM(sj.status = 'Repair') as repair,
      SUM(sj.status = 'Testing') as testing,
      SUM(sj.status = 'Completion') as completion,
      SUM(assigned_count = 0) as unassigned
    FROM (
      SELECT 
        sj.status,
        COUNT(sjt.technicianId) as assigned_count
      FROM service_job sj
      LEFT JOIN service_job_technician sjt ON sj.serviceJobId = sjt.serviceJobId
      GROUP BY sj.serviceJobId
    ) AS job_counts
  `);
  return rows[0];
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
  getServiceJobsByTechnician,
  searchServiceJobs,
  getServiceJobSummary,
   
};