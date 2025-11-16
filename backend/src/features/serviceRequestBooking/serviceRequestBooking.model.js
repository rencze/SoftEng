const pool = require("../../config/db");
const moment = require("moment"); 
// Create service request
async function createServiceRequestModel({ 
  customerId, 
  technicianId, 
  timeSlotId,
  services = [], 
  servicePackages = [], 
  notes 
}) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 🔒 BLOCKING CHECK 1: Check if technician is booked in booking table
    const [existing] = await conn.query(
      `SELECT * FROM booking WHERE technicianId = ? AND timeSlotId = ? FOR UPDATE`,
      [technicianId, timeSlotId]
    );

    if (existing.length > 0)
      throw new Error("Technician is already booked at this time");

    // 🔒 BLOCKING CHECK 2: Check if technician is assigned in service_request_booking table
    const [existingService] = await conn.query(
      `SELECT * FROM serviceRequestBooking WHERE technicianId = ? AND timeSlotId = ? FOR UPDATE`,
      [technicianId, timeSlotId]
    );

    if (existingService.length > 0)
      throw new Error("Technician is already assigned to a service request at this time");

    // 1. Create main service request
    const [result] = await conn.query(
      `INSERT INTO serviceRequestBooking (customerId, technicianId, timeSlotId, notes, status)
       VALUES (?, ?, ?, ?, ?)`,
      [customerId, technicianId || null, timeSlotId, notes || null, 'Pending']
    );

    const serviceRequestId = result.insertId;

    // 2. Add multiple services (only if provided)
    if (services && services.length > 0) {
      const serviceValues = services.map(service => [
        serviceRequestId,
        service.serviceId,
        service.quantity || 1
      ]);
      
      await conn.query(
        `INSERT INTO serviceRequestBookingServices (serviceRequestId, servicesId, quantity)
         VALUES ?`,
        [serviceValues]
      );
    }

    // 3. Add multiple service packages (only if provided)
    if (servicePackages && servicePackages.length > 0) {
      const packageValues = servicePackages.map(pkg => [
        serviceRequestId,
        pkg.servicePackageId,
        pkg.quantity || 1
      ]);
      
      await conn.query(
        `INSERT INTO serviceRequestBookingPackages (serviceRequestId, servicePackageId, quantity)
         VALUES ?`,
        [packageValues]
      );
    }

    // 🔒 BLOCKING CHECK 3: Mark technician unavailable in availability table
    await conn.query(`
      INSERT INTO technicianAvailability (technicianId, timeSlotId, isAvailable)
      VALUES (?, ?, FALSE)
      ON DUPLICATE KEY UPDATE isAvailable = FALSE, updatedAt = CURRENT_TIMESTAMP
    `, [technicianId, timeSlotId]);

    // 4. Log history
    await conn.query(
      `INSERT INTO serviceRequestBookingHistory (serviceRequestId, status, remarks)
       VALUES (?, ?, ?)`,
      [serviceRequestId, 'Pending', "Service request created"]
    );

    await conn.commit();
    return { 
      serviceRequestId, 
      customerId, 
      technicianId, 
      timeSlotId,
      services,
      servicePackages,
      notes, 
      status: 'Pending' 
    };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

// Helper function to determine service type
function determineServiceType(services, packages) {
  if (packages && packages.length > 0) {
    return packages[0].packageName;
  }
  if (services && services.length > 0) {
    return services[0].serviceName;
  }
  return 'General Service';
}

// Get all service requests with proper customer data
async function getAllServiceRequestsModel() {
  const conn = await pool.getConnection();
  try {
    console.log('🔍 Starting getAllServiceRequestsModel...');

    const [rows] = await conn.query(`
      SELECT 
        srb.serviceRequestId,
        srb.status,
        srb.notes,
        DATE(srb.createdAt) AS createdAt,

        -- Customer info
        CONCAT(cu.firstName, ' ', cu.lastName) AS customerName,
        cu.contactNumber AS customerPhone,
        cu.email AS customerEmail,
        cu.address AS address,

        -- Technician info
        CONCAT(tu.firstName, ' ', tu.lastName) AS assignedTechnician,

        -- Timeslot info
        sd.slotDate AS requestedDate,
        ts.startTime,
        ts.endTime,

        -- Services JSON array - FIXED: Include consistent serviceId
        COALESCE(
            JSON_ARRAYAGG(
                IF(srs.Id IS NOT NULL,
                    JSON_OBJECT(
                        'id', srs.Id,
                        'serviceId', s.servicesId,  -- ✅ Always use 'serviceId'
                        'serviceName', s.servicesName,
                        'serviceDescription', s.servicesDescription,
                        'quantity', srs.quantity
                    ),
                    NULL
                )
            ),
            JSON_ARRAY()
        ) AS services,

        -- Service Packages JSON array - FIXED: Include consistent servicePackageId
        COALESCE(
            JSON_ARRAYAGG(
                IF(srp.Id IS NOT NULL,
                    JSON_OBJECT(
                        'id', srp.Id,
                        'servicePackageId', sp.servicePackageId,  -- ✅ Always use 'servicePackageId'
                        'packageName', sp.packageName,
                        'packageDescription', sp.packageDescription,
                        'quantity', srp.quantity
                    ),
                    NULL
                )
            ),
            JSON_ARRAY()
        ) AS servicePackages

      FROM serviceRequestBooking srb

      -- Customer join
      INNER JOIN customers c ON srb.customerId = c.customerId
      INNER JOIN users cu ON c.userId = cu.userId

      -- Technician join
      LEFT JOIN technicians t ON srb.technicianId = t.technicianId
      LEFT JOIN users tu ON t.userId = tu.userId

      -- Timeslot join
      LEFT JOIN timeSlot ts ON srb.timeSlotId = ts.timeSlotId
      LEFT JOIN slotDate sd ON ts.slotDateId = sd.slotDateId

      -- Services join
      LEFT JOIN serviceRequestBookingServices srs 
             ON srb.serviceRequestId = srs.serviceRequestId
      LEFT JOIN services s 
             ON srs.servicesId = s.servicesId

      -- Service Packages join
      LEFT JOIN serviceRequestBookingPackages srp 
             ON srb.serviceRequestId = srp.serviceRequestId
      LEFT JOIN service_packages sp 
             ON srp.servicePackageId = sp.servicePackageId

      GROUP BY srb.serviceRequestId, cu.userId, tu.userId, sd.slotDate, ts.startTime, ts.endTime
      ORDER BY srb.createdAt DESC
    `);

    console.log(`📊 Raw SQL result: ${rows.length} rows`);

    // Process the rows to format the data properly
    const processedRows = rows.map(row => {
      // Parse JSON arrays for services and packages
      const services = Array.isArray(row.services) ? row.services : 
                     (typeof row.services === 'string' ? JSON.parse(row.services) : []);
      
      const servicePackages = Array.isArray(row.servicePackages) ? row.servicePackages : 
                            (typeof row.servicePackages === 'string' ? JSON.parse(row.servicePackages) : []);

      // Filter out null values from JSON_ARRAYAGG
      const filteredServices = services.filter(service => service !== null);
      const filteredPackages = servicePackages.filter(pkg => pkg !== null);

      // Debug: Log the IDs to verify they're present
      console.log('🔍 DEBUG - Filtered Services:', filteredServices.map(s => ({
        serviceId: s.serviceId,
        serviceName: s.serviceName
      })));
      console.log('🔍 DEBUG - Filtered Packages:', filteredPackages.map(p => ({
        servicePackageId: p.servicePackageId,
        packageName: p.packageName
      })));

      // Create description from services or packages
      let description = '';
      if (filteredServices.length > 0) {
        description = filteredServices.map(s => s.serviceDescription).filter(Boolean).join('; ');
      } else if (filteredPackages.length > 0) {
        description = filteredPackages.map(p => p.packageDescription).filter(Boolean).join('; ');
      }

      return {
        serviceRequestId: row.serviceRequestId,
        customerName: row.customerName,
        customerPhone: row.customerPhone,
        customerEmail: row.customerEmail,
        address: row.address,
        assignedTechnician: row.assignedTechnician,
        serviceType: determineServiceType(filteredServices, filteredPackages),
        description: description,
        status: row.status,
        notes: row.notes,
        createdAt: row.createdAt,
        requestedDate: row.requestedDate,
        startTime: row.startTime,
        endTime: row.endTime,
        services: filteredServices,
        servicePackages: filteredPackages
      };
    });

    console.log('✅ Service requests processed successfully');
    return processedRows;

  } catch (error) {
    console.error('❌ Critical error in getAllServiceRequestsModel:', {
      message: error.message,
      sqlMessage: error.sqlMessage,
      code: error.code,
      stack: error.stack
    });
    throw error;
  } finally {
    conn.release();
  }
}

// Get service request by ID
async function getServiceRequestByIdModel(serviceRequestId) {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query(`
      SELECT 
        srb.serviceRequestId,
        srb.status,
        srb.notes,
        DATE(srb.createdAt) AS createdAt,

        -- Customer info
        CONCAT(cu.firstName, ' ', cu.lastName) AS customerName,
        cu.contactNumber AS customerPhone,
        cu.email AS customerEmail,
        cu.address AS address,

        -- Technician info
        CONCAT(tu.firstName, ' ', tu.lastName) AS assignedTechnician,

        -- Timeslot info
        sd.slotDate AS requestedDate,
        ts.startTime,
        ts.endTime,

        -- Services JSON array - FIXED: Include consistent serviceId
        COALESCE(
            JSON_ARRAYAGG(
                IF(srs.Id IS NOT NULL,
                    JSON_OBJECT(
                        'id', srs.Id,
                        'serviceId', s.servicesId,  -- ✅ Always use 'serviceId'
                        'serviceName', s.servicesName,
                        'serviceDescription', s.servicesDescription,
                        'quantity', srs.quantity
                    ),
                    NULL
                )
            ),
            JSON_ARRAY()
        ) AS services,

        -- Service Packages JSON array - FIXED: Include consistent servicePackageId
        COALESCE(
            JSON_ARRAYAGG(
                IF(srp.Id IS NOT NULL,
                    JSON_OBJECT(
                        'id', srp.Id,
                        'servicePackageId', sp.servicePackageId,  -- ✅ Always use 'servicePackageId'
                        'packageName', sp.packageName,
                        'packageDescription', sp.packageDescription,
                        'quantity', srp.quantity
                    ),
                    NULL
                )
            ),
            JSON_ARRAY()
        ) AS servicePackages

      FROM serviceRequestBooking srb

      -- Customer join
      INNER JOIN customers c ON srb.customerId = c.customerId
      INNER JOIN users cu ON c.userId = cu.userId

      -- Technician join
      LEFT JOIN technicians t ON srb.technicianId = t.technicianId
      LEFT JOIN users tu ON t.userId = tu.userId

      -- Timeslot join
      LEFT JOIN timeSlot ts ON srb.timeSlotId = ts.timeSlotId
      LEFT JOIN slotDate sd ON ts.slotDateId = sd.slotDateId

      -- Services join
      LEFT JOIN serviceRequestBookingServices srs 
             ON srb.serviceRequestId = srs.serviceRequestId
      LEFT JOIN services s 
             ON srs.servicesId = s.servicesId

      -- Service Packages join
      LEFT JOIN serviceRequestBookingPackages srp 
             ON srb.serviceRequestId = srp.serviceRequestId
      LEFT JOIN service_packages sp 
             ON srp.servicePackageId = sp.servicePackageId

      WHERE srb.serviceRequestId = ?
      GROUP BY srb.serviceRequestId, cu.userId, tu.userId, sd.slotDate, ts.startTime, ts.endTime
    `, [serviceRequestId]);

    if (rows.length === 0) return null;

    const row = rows[0];
    
    // Parse JSON arrays
    const services = Array.isArray(row.services) ? row.services : 
                   (typeof row.services === 'string' ? JSON.parse(row.services) : []);
    const servicePackages = Array.isArray(row.servicePackages) ? row.servicePackages : 
                          (typeof row.servicePackages === 'string' ? JSON.parse(row.servicePackages) : []);

    const filteredServices = services.filter(service => service !== null);
    const filteredPackages = servicePackages.filter(pkg => pkg !== null);

    let description = '';
    if (filteredServices.length > 0) {
      description = filteredServices.map(s => s.serviceDescription).filter(Boolean).join('; ');
    } else if (filteredPackages.length > 0) {
      description = filteredPackages.map(p => p.packageDescription).filter(Boolean).join('; ');
    }

    return {
      serviceRequestId: row.serviceRequestId,
      customerName: row.customerName,
      customerPhone: row.customerPhone,
      customerEmail: row.customerEmail,
      address: row.address,
      assignedTechnician: row.assignedTechnician,
      serviceType: determineServiceType(filteredServices, filteredPackages),
      description: description,
      status: row.status,
      notes: row.notes,
      createdAt: row.createdAt,
      requestedDate: row.requestedDate,
      startTime: row.startTime,
      endTime: row.endTime,
      services: filteredServices,
      servicePackages: filteredPackages
    };

  } catch (error) {
    console.error('❌ Error in getServiceRequestByIdModel:', error);
    throw error;
  } finally {
    conn.release();
  }
}

// Get service requests by customer
async function getServiceRequestsByCustomerModel(customerId) {
  const [rows] = await pool.query(`
    SELECT 
      srb.*,
      CONCAT(tu.firstName, ' ', tu.lastName) AS technicianName,
      ts.startTime, ts.endTime, ts.date
    FROM serviceRequestBooking srb
    LEFT JOIN technicians t ON srb.technicianId = t.technicianId
    LEFT JOIN users tu ON t.userId = tu.userId
    LEFT JOIN timeSlot ts ON srb.timeSlotId = ts.timeSlotId
    WHERE srb.customerId = ?
    ORDER BY srb.createdAt DESC
  `, [customerId]);
  
  for (let request of rows) {
    const [services] = await pool.query(`
      SELECT srbs.*, s.serviceName, s.serviceDescription, s.price
      FROM serviceRequestBookingServices srbs
      JOIN services s ON srbs.servicesId = s.servicesId
      WHERE srbs.serviceRequestId = ?
    `, [request.serviceRequestId]);
    
    const [packages] = await pool.query(`
      SELECT srbp.*, sp.packageName, sp.packageDescription, sp.price
      FROM serviceRequestBookingPackages srbp
      JOIN service_packages sp ON srbp.servicePackageId = sp.servicePackageId
      WHERE srbp.serviceRequestId = ?
    `, [request.serviceRequestId]);
    
    request.services = services;
    request.servicePackages = packages;
  }
  
  return rows;
}

// Update service request info
async function updateServiceRequestModel(serviceRequestId, { technicianId, timeSlotId, notes }) {
  const [result] = await pool.query(
    `UPDATE serviceRequestBooking 
     SET technicianId = ?, timeSlotId = ?, notes = ? 
     WHERE serviceRequestId = ?`,
    [technicianId || null, timeSlotId || null, notes || null, serviceRequestId]
  );
  return result;
}

// Delete service request (with cascade)
async function deleteServiceRequestModel(serviceRequestId) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    
    await conn.query(
      `DELETE FROM serviceRequestBookingServices WHERE serviceRequestId = ?`,
      [serviceRequestId]
    );
    
    await conn.query(
      `DELETE FROM serviceRequestBookingPackages WHERE serviceRequestId = ?`,
      [serviceRequestId]
    );
    
    await conn.query(
      `DELETE FROM serviceRequestBookingHistory WHERE serviceRequestId = ?`,
      [serviceRequestId]
    );
    
    const [result] = await conn.query(
      `DELETE FROM serviceRequestBooking WHERE serviceRequestId = ?`, 
      [serviceRequestId]
    );
    
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

// Update service request status
async function updateServiceRequestStatusModel(serviceRequestId, status, changedBy, remarks) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(
      `UPDATE serviceRequestBooking SET status = ? WHERE serviceRequestId = ?`,
      [status, serviceRequestId]
    );

    await conn.query(
      `INSERT INTO serviceRequestBookingHistory (serviceRequestId, status, changedBy, remarks)
       VALUES (?, ?, ?, ?)`,
      [serviceRequestId, status, changedBy || null, remarks || "Status updated"]
    );

    await conn.commit();
    return { serviceRequestId, status, remarks };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

// Service request history
async function getServiceRequestHistoryModel(serviceRequestId) {
  const [rows] = await pool.query(`
    SELECT 
      srbh.*,
      CONCAT(u.firstName, ' ', u.lastName) AS changedByName
    FROM serviceRequestBookingHistory srbh
    LEFT JOIN users u ON srbh.changedBy = u.userId
    WHERE srbh.serviceRequestId = ?
    ORDER BY srbh.changedAt DESC
  `, [serviceRequestId]);
  return rows;
}

// Get service requests by technician
async function getServiceRequestsByTechnicianModel(technicianId) {
  const [rows] = await pool.query(`
    SELECT 
      srb.*,
      CONCAT(cu.firstName, ' ', cu.lastName) AS customerName,
      ts.startTime, ts.endTime, ts.date
    FROM serviceRequestBooking srb
    LEFT JOIN customers c ON srb.customerId = c.customerId
    LEFT JOIN users cu ON c.userId = cu.userId
    LEFT JOIN timeSlot ts ON srb.timeSlotId = ts.timeSlotId
    WHERE srb.technicianId = ?
    ORDER BY srb.createdAt DESC
  `, [technicianId]);
  
  for (let request of rows) {
    const [services] = await pool.query(`
      SELECT srbs.*, s.serviceName, s.serviceDescription, s.price
      FROM serviceRequestBookingServices srbs
      JOIN services s ON srbs.servicesId = s.servicesId
      WHERE srbs.serviceRequestId = ?
    `, [request.serviceRequestId]);
    
    const [packages] = await pool.query(`
      SELECT srbp.*, sp.packageName, sp.packageDescription, sp.price
      FROM serviceRequestBookingPackages srbp
      JOIN service_packages sp ON srbp.servicePackageId = sp.servicePackageId
      WHERE srbp.serviceRequestId = ?
    `, [request.serviceRequestId]);
    
    request.services = services;
    request.servicePackages = packages;
  }
  
  return rows;
}

async function rescheduleServiceRequestBookingModel(serviceRequestId, technicianId, timeSlotId, rescheduledDate, remarks) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Convert rescheduledDate to YYYY-MM-DD
    const date = new Date(rescheduledDate);
    if (isNaN(date.getTime())) throw new Error("Invalid rescheduledDate format");
    const formattedDate = date.toISOString().split('T')[0];

    // Get slotDateId for the given date
    const [slotDate] = await conn.query(
      "SELECT slotDateId FROM slotDate WHERE slotDate = ?",
      [formattedDate]
    );
    if (slotDate.length === 0) throw new Error(`No slot date found for ${formattedDate}`);
    const slotDateId = slotDate[0].slotDateId;

    // Verify timeSlot exists for the slotDateId AND update timeSlot if needed
    const [timeSlot] = await conn.query(
      "SELECT timeSlotId FROM timeSlot WHERE timeSlotId = ? AND slotDateId = ?",
      [timeSlotId, slotDateId]
    );
    if (timeSlot.length === 0) {
      // If timeSlot doesn't exist for this date, you might need to create it
      // or find the correct timeSlotId for this date
      throw new Error(`Time slot ${timeSlotId} not available for date ${formattedDate}`);
    }

    // Update service request - ADD requestedDate if you have that column
    const [updateResult] = await conn.query(
      `UPDATE serviceRequestBooking
       SET technicianId = ?, timeSlotId = ?, status = 'Rescheduled', updatedAt = CURRENT_TIMESTAMP
       WHERE serviceRequestId = ?`,
      [technicianId, timeSlotId, serviceRequestId]
    );

    if (updateResult.affectedRows === 0) throw new Error(`Service request ${serviceRequestId} not found`);

    // Debug: Check what was updated
    const [verify] = await conn.query(
      `SELECT srb.*, ts.timeSlotId, sd.slotDate 
       FROM serviceRequestBooking srb
       LEFT JOIN timeSlot ts ON srb.timeSlotId = ts.timeSlotId  
       LEFT JOIN slotDate sd ON ts.slotDateId = sd.slotDateId
       WHERE srb.serviceRequestId = ?`,
      [serviceRequestId]
    );
    console.log('🔍 After update:', verify[0]);

    // ... rest of your existing code (history, technician availability, etc.)

    await conn.commit();
    return { success: true, message: "Service request successfully rescheduled" };

  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}


module.exports = {
  getAllServiceRequestsModel,
  getServiceRequestByIdModel,
  createServiceRequestModel,
  updateServiceRequestModel,
  deleteServiceRequestModel,
  updateServiceRequestStatusModel,
  getServiceRequestHistoryModel,
  getServiceRequestsByCustomerModel,
  getServiceRequestsByTechnicianModel,
  rescheduleServiceRequestBookingModel,
};


