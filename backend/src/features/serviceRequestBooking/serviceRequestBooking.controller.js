const pool = require("../../config/db");
const ServiceRequestModel = require("./serviceRequestBooking.model");
const moment = require("moment");

// Get all service requests
async function getAllServiceRequests(req, res) {
  try {
    console.log('📦 Fetching all service requests...');
    const serviceRequests = await ServiceRequestModel.getAllServiceRequestsModel();
    console.log(`✅ Found ${serviceRequests.length} service requests`);
    res.json(serviceRequests);
  } catch (err) {
    console.error('❌ Detailed error in getAllServiceRequests:', {
      message: err.message,
      stack: err.stack,
      sqlMessage: err.sqlMessage,
      code: err.code
    });
    
    res.status(500).json({ 
      error: err.message,
      sqlError: err.sqlMessage,
      message: 'Failed to fetch service requests from database'
    });
  }
}

// Get service request by ID
async function getServiceRequestById(req, res) {
  try {
    const { id } = req.params;
    const serviceRequest = await ServiceRequestModel.getServiceRequestByIdModel(id);
    if (!serviceRequest) return res.status(404).json({ message: "Service request not found" });
    res.json(serviceRequest);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Create service request
async function createServiceRequest(req, res) {
  try {
    const { customerId, technicianId, timeSlotId, services = [], servicePackages = [], notes } = req.body;
    
    console.log("Received request:", { customerId, timeSlotId, services, servicePackages });

    if (!customerId) {
      return res.status(400).json({ message: "customerId is required" });
    }

    if (!timeSlotId) {
      return res.status(400).json({ message: "timeSlotId is required" });
    }

    if (!technicianId) {
      return res.status(400).json({ message: "technicianId is required" });
    }

    if ((!services || services.length === 0) && (!servicePackages || servicePackages.length === 0)) {
      return res.status(400).json({ 
        message: "At least one service or service package is required" 
      });
    }

    if (services && services.length > 0) {
      for (const service of services) {
        if (!service.serviceId) {
          return res.status(400).json({ 
            message: "Each service must have a serviceId" 
          });
        }
      }
    }

    if (servicePackages && servicePackages.length > 0) {
      for (const pkg of servicePackages) {
        if (!pkg.servicePackageId) {
          return res.status(400).json({ 
            message: "Each service package must have a servicePackageId" 
          });
        }
      }
    }

    const serviceRequest = await ServiceRequestModel.createServiceRequestModel({
      customerId, 
      technicianId, 
      timeSlotId,
      services, 
      servicePackages, 
      notes 
    });
    
    res.status(201).json({ 
      message: "Service request created successfully", 
      serviceRequest 
    });
  } catch (err) {
    console.error("Error creating service request:", err);
    
    if (err.message.includes("Technician is already booked") || 
        err.message.includes("Technician is already assigned")) {
      return res.status(400).json({ 
        message: err.message 
      });
    }
    
    res.status(500).json({ error: err.message });
  }
}

// Update service request info
async function updateServiceRequest(req, res) {
  try {
    const { id } = req.params;
    const { technicianId, timeSlotId, notes } = req.body;
    
    const result = await ServiceRequestModel.updateServiceRequestModel(id, { 
      technicianId, 
      timeSlotId, 
      notes 
    });
    
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Service request not found" });
    res.json({ message: "Service request updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Delete service request
async function deleteServiceRequest(req, res) {
  try {
    const { id } = req.params;
    const result = await ServiceRequestModel.deleteServiceRequestModel(id);
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Service request not found" });
    res.json({ message: "Service request deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Update service request status
async function updateServiceRequestStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, changedBy, remarks } = req.body;
    
    if (!['Pending', 'Accepted', 'Reviewed', 'Converted', 'Cancelled', 'Rescheduled'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const result = await ServiceRequestModel.updateServiceRequestStatusModel(
      id, status, changedBy, remarks
    );
    res.json({ message: "Service request status updated successfully", result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get service request history
async function getServiceRequestHistory(req, res) {
  try {
    const { id } = req.params;
    const history = await ServiceRequestModel.getServiceRequestHistoryModel(id);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get service requests by customer
async function getServiceRequestsByCustomer(req, res) {
  try {
    const { customerId } = req.params;
    const serviceRequests = await ServiceRequestModel.getServiceRequestsByCustomerModel(customerId);
    res.json(serviceRequests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get service requests by technician
async function getServiceRequestsByTechnician(req, res) {
  try {
    const { technicianId } = req.params;
    const serviceRequests = await ServiceRequestModel.getServiceRequestsByTechnicianModel(technicianId);
    res.json(serviceRequests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Check if technician is available for time slot
async function checkTechnicianAvailability(technicianId, timeSlotId) {
  const [rows] = await pool.query(`
    SELECT serviceRequestId 
    FROM serviceRequestBooking 
    WHERE technicianId = ? AND timeSlotId = ? AND status NOT IN ('Cancelled', 'Completed')
  `, [technicianId, timeSlotId]);
  
  return rows.length > 0;
}

// Check if time slot is available (not blocked)
async function checkTimeSlotAvailability(timeSlotId) {
  const [rows] = await pool.query(`
    SELECT isAvailable FROM timeSlot WHERE timeSlotId = ?
  `, [timeSlotId]);
  
  return rows.length > 0 && rows[0].isAvailable;
}

// Placeholder functions for additional routes
async function fetchServiceRequestBookedTechnicians(req, res) {
  try {
    const { timeSlotId } = req.params;
    res.status(501).json({ message: "fetchServiceRequestBookedTechnicians not implemented yet" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getServiceRequestSlotsWithBookedTechnicians(req, res) {
  try {
    const { date } = req.params;
    res.status(501).json({ message: "getServiceRequestSlotsWithBookedTechnicians not implemented yet" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getServiceRequestTechnicianAvailability(req, res) {
  try {
    res.status(501).json({ message: "getServiceRequestTechnicianAvailability not implemented yet" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getServiceRequestTechnicianAvailabilityByTechnician(req, res) {
  try {
    res.status(501).json({ message: "getServiceRequestTechnicianAvailabilityByTechnician not implemented yet" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function rescheduleServiceRequestBooking(req, res) {
  try {
    const { id } = req.params; // serviceRequestId
    const { technicianId, timeSlotId, rescheduledDate, remarks } = req.body;

    console.log('🔁 Reschedule request received:', { 
      id, 
      technicianId, 
      timeSlotId, 
      rescheduledDate,
      remarks 
    });

    // Validate all required fields
    if (!id || !technicianId || !timeSlotId || !rescheduledDate) {
      console.log('❌ Missing required fields:', {
        id: !!id,
        technicianId: !!technicianId,
        timeSlotId: !!timeSlotId,
        rescheduledDate: !!rescheduledDate
      });
      
      return res.status(400).json({
        message: "serviceRequestId, technicianId, timeSlotId, and rescheduledDate are all required",
        missing: {
          serviceRequestId: !id,
          technicianId: !technicianId,
          timeSlotId: !timeSlotId,
          rescheduledDate: !rescheduledDate
        }
      });
    }

    // Convert IDs to numbers to ensure they're numeric
    const serviceRequestId = parseInt(id);
    const techId = parseInt(technicianId);
    const slotId = parseInt(timeSlotId);

    if (isNaN(serviceRequestId) || isNaN(techId) || isNaN(slotId)) {
      return res.status(400).json({
        message: "IDs must be valid numbers",
        details: {
          serviceRequestId: id,
          technicianId: technicianId,
          timeSlotId: timeSlotId
        }
      });
    }

    console.log('✅ Validated parameters:', {
      serviceRequestId,
      techId,
      slotId,
      rescheduledDate
    });

    const result = await ServiceRequestModel.rescheduleServiceRequestBookingModel(
      serviceRequestId,
      techId,
      slotId,
      rescheduledDate,
      remarks
    );

    res.status(200).json(result);
  } catch (err) {
    console.error("❌ Error rescheduling service request:", err);
    res.status(500).json({ 
      message: err.message || "Failed to reschedule service request",
      error: err.message
    });
  }
}




// Export all functions with the names expected by routes
module.exports = {
  // Main CRUD functions
  getAllServiceRequestBookings: getAllServiceRequests,
  getServiceRequestBookingById: getServiceRequestById,
  createServiceRequestBooking: createServiceRequest,
  updateServiceRequestBooking: updateServiceRequest,
  deleteServiceRequestBooking: deleteServiceRequest,
  updateServiceRequestBookingStatus: updateServiceRequestStatus,
  getServiceRequestBookingHistory: getServiceRequestHistory,
  
  // Additional routes
  fetchServiceRequestBookedTechnicians,
  getServiceRequestSlotsWithBookedTechnicians,
  getServiceRequestTechnicianAvailability,
  getServiceRequestTechnicianAvailabilityByTechnician,
  rescheduleServiceRequestBooking,
  
  // Customer and technician specific
  getServiceRequestsByCustomer,
  getServiceRequestsByTechnician,
};
