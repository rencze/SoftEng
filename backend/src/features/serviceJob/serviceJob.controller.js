const {
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
  getServiceJobSummary
} = require("./serviceJob.model");

// Transform backend data to frontend format
function transformServiceJobForFrontend(backendJob) {
  // Combine services and packages into serviceType array
  const serviceType = [
    ...(backendJob.services?.map(s => s.servicesName) || []),
    ...(backendJob.servicePackages?.map(p => p.packageName) || [])
  ];

  // Transform work logs
  const workLog = (backendJob.workLogs || []).map(log => ({
    id: log.worklogId,
    date: log.formattedDate || log.workDate?.split(' ')[0] || new Date().toISOString().split('T')[0],
    time: log.formattedTime || '00:00 AM',
    action: log.workDescription,
    technician: log.technicianName || 'System',
    notes: log.remarks || ''
  }));

  // Get assigned technician names only
  const assignedTechnicians = (backendJob.assignedTechnicians || []).map(t => t.technicianName);

  return {
    id: backendJob.serviceJobId,
    jobNumber: backendJob.serviceJobNumber, // SJ- format
    customerName: backendJob.customerName,
    customerPhone: backendJob.customerPhone,
    customerEmail: backendJob.customerEmail,
    serviceType: serviceType.length > 0 ? serviceType : ['General Service'],
    description: backendJob.jobDescription || 'No description provided',
    status: backendJob.status,
    createdAt: backendJob.createdAt?.split(' ')[0] || new Date().toISOString().split('T')[0],
    scheduledDate: backendJob.startDate?.split(' ')[0] || new Date().toISOString().split('T')[0],
    address: backendJob.customerAddress || 'Address not specified',
    assignedTechnicians: assignedTechnicians,
    estimatedDuration: backendJob.workTimeEstimation || 'Not specified', // From quotation
    notes: backendJob.remarks || '',
    workLog: workLog,

    // Additional backend data that might be useful
    _raw: {
      quotationNumber: backendJob.quotationNumber,
      displayPlateNumber: backendJob.displayPlateNumber,
      displayBrand: backendJob.displayBrand,
      displayModel: backendJob.displayModel,
      displayYear: backendJob.displayYear
    }
  };
}

// Get all service jobs
async function fetchServiceJobs(req, res) {
  try {
    const { search, status } = req.query;
    
    let serviceJobs;
    if (search || (status && status !== 'All')) {
      serviceJobs = await searchServiceJobs(search, status);
    } else {
      serviceJobs = await getAllServiceJobs();
    }

    // Transform data for frontend
    const transformedJobs = serviceJobs.map(transformServiceJobForFrontend);
    
    res.json(transformedJobs);
  } catch (err) {
    console.error('Error fetching service jobs:', err);
    res.status(500).json({ error: err.message });
  }
}

// Get single service job
async function fetchServiceJob(req, res) {
  try {
    const serviceJob = await getServiceJobById(req.params.id);
    if (!serviceJob) return res.status(404).json({ error: "Service job not found" });
    
    // Transform data for frontend
    const transformedJob = transformServiceJobForFrontend(serviceJob);
    res.json(transformedJob);
  } catch (err) {
    console.error('Error fetching service job:', err);
    res.status(500).json({ error: err.message });
  }
}

// Create new service job
async function createServiceJobController(req, res) {
  try {
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
    } = req.body;

    console.log('Creating service job:', {
      quotationId,
      vehicleId,
      guestPlateNumber,
      technicianIds,
      status
    });

    // Validate required fields
    if (!quotationId) {
      return res.status(400).json({ error: "quotationId is required" });
    }

    const newServiceJob = await createServiceJob({
      quotationId,
      vehicleId: vehicleId || null,
      jobDescription,
      guestPlateNumber,
      guestBrand,
      guestModel,
      guestYear,
      startDate,
      endDate,
      remarks,
      status,
      technicianIds
    });

    console.log('Service job created successfully:', {
      id: newServiceJob.serviceJobId,
      serviceJobNumber: newServiceJob.serviceJobNumber
    });

    // Transform response for frontend
    const transformedJob = transformServiceJobForFrontend(newServiceJob);
    res.status(201).json(transformedJob);
  } catch (err) {
    console.error('Error creating service job:', err);
    res.status(500).json({ error: err.message });
  }
}

// Update service job
async function updateServiceJobController(req, res) {
  try {
    const serviceJob = await getServiceJobById(req.params.id);
    if (!serviceJob) return res.status(404).json({ error: "Service job not found" });

    const updatedServiceJob = await updateServiceJob(req.params.id, req.body);
    
    // Transform response for frontend
    const transformedJob = transformServiceJobForFrontend(updatedServiceJob);
    res.json(transformedJob);
  } catch (err) {
    console.error('Error updating service job:', err);
    res.status(500).json({ error: err.message });
  }
}

// Delete service job
async function deleteServiceJobController(req, res) {
  try {
    const serviceJob = await getServiceJobById(req.params.id);
    if (!serviceJob) return res.status(404).json({ error: "Service job not found" });

    await deleteServiceJob(req.params.id);
    res.json({ message: "Service job deleted successfully" });
  } catch (err) {
    console.error('Error deleting service job:', err);
    res.status(500).json({ error: err.message });
  }
}

// Update service job status
async function updateServiceJobStatusController(req, res) {
  try {
    const serviceJob = await getServiceJobById(req.params.id);
    if (!serviceJob) return res.status(404).json({ error: "Service job not found" });

    const { status, notes } = req.body;
    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    const validStatuses = ['Checked In', 'Repair', 'Testing', 'Completion'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const updatedServiceJob = await updateServiceJobStatus(req.params.id, status, notes);
    
    // Transform response for frontend
    const transformedJob = transformServiceJobForFrontend(updatedServiceJob);
    res.json(transformedJob);
  } catch (err) {
    console.error('Error updating service job status:', err);
    res.status(500).json({ error: err.message });
  }
}

// Assign technician to service job
async function assignTechnicianController(req, res) {
  try {
    const serviceJob = await getServiceJobById(req.params.id);
    if (!serviceJob) return res.status(404).json({ error: "Service job not found" });

    const { technicianId } = req.body;
    if (!technicianId) {
      return res.status(400).json({ error: "technicianId is required" });
    }

    const result = await assignTechnicianToJob(req.params.id, technicianId);
    res.status(201).json(result);
  } catch (err) {
    console.error('Error assigning technician:', err);
    res.status(500).json({ error: err.message });
  }
}

// Remove technician from service job
async function removeTechnicianController(req, res) {
  try {
    const serviceJob = await getServiceJobById(req.params.id);
    if (!serviceJob) return res.status(404).json({ error: "Service job not found" });

    const { technicianId } = req.body;
    if (!technicianId) {
      return res.status(400).json({ error: "technicianId is required" });
    }

    const result = await removeTechnicianFromJob(req.params.id, technicianId);
    res.json(result);
  } catch (err) {
    console.error('Error removing technician:', err);
    res.status(500).json({ error: err.message });
  }
}

// Get service job technicians
async function fetchServiceJobTechnicians(req, res) {
  try {
    const serviceJob = await getServiceJobById(req.params.id);
    if (!serviceJob) return res.status(404).json({ error: "Service job not found" });

    const technicians = await getServiceJobTechnicians(req.params.id);
    res.json(technicians);
  } catch (err) {
    console.error('Error fetching service job technicians:', err);
    res.status(500).json({ error: err.message });
  }
}

// Add work log to service job
async function addWorkLogController(req, res) {
  try {
    const serviceJob = await getServiceJobById(req.params.id);
    if (!serviceJob) return res.status(404).json({ error: "Service job not found" });

    const { workDescription, remarks, technicianId } = req.body;

    if (!workDescription) {
      return res.status(400).json({ error: "workDescription is required" });
    }

    const result = await addWorkLogToJob(req.params.id, {
      workDescription,
      remarks,
      technicianId
    });

    res.status(201).json(result);
  } catch (err) {
    console.error('Error adding work log:', err);
    res.status(500).json({ error: err.message });
  }
}

// Get service job work logs
async function fetchServiceJobWorkLogs(req, res) {
  try {
    const serviceJob = await getServiceJobById(req.params.id);
    if (!serviceJob) return res.status(404).json({ error: "Service job not found" });

    const workLogs = await getServiceJobWorkLogs(req.params.id);
    res.json(workLogs);
  } catch (err) {
    console.error('Error fetching service job work logs:', err);
    res.status(500).json({ error: err.message });
  }
}

// Update work log
async function updateWorkLogController(req, res) {
  try {
    const { workLogId } = req.params;
    const { workDescription, remarks } = req.body;

    if (!workDescription) {
      return res.status(400).json({ error: "workDescription is required" });
    }

    const updatedWorkLog = await updateWorkLog(workLogId, {
      workDescription,
      remarks
    });

    if (!updatedWorkLog) {
      return res.status(404).json({ error: "Work log not found" });
    }

    res.json(updatedWorkLog);
  } catch (err) {
    console.error('Error updating work log:', err);
    res.status(500).json({ error: err.message });
  }
}

// Delete work log
async function deleteWorkLogController(req, res) {
  try {
    const { workLogId } = req.params;

    await deleteWorkLog(workLogId);
    res.json({ message: "Work log deleted successfully" });
  } catch (err) {
    console.error('Error deleting work log:', err);
    res.status(500).json({ error: err.message });
  }
}

// Get service jobs by status
async function fetchServiceJobsByStatus(req, res) {
  try {
    const { status } = req.params;
    const serviceJobs = await getServiceJobsByStatus(status);
    
    // Transform data for frontend
    const transformedJobs = serviceJobs.map(transformServiceJobForFrontend);
    res.json(transformedJobs);
  } catch (err) {
    console.error('Error fetching service jobs by status:', err);
    res.status(500).json({ error: err.message });
  }
}

// Get service jobs by technician
async function fetchServiceJobsByTechnician(req, res) {
  try {
    const { technicianId } = req.params;
    const serviceJobs = await getServiceJobsByTechnician(technicianId);
    
    // Transform data for frontend
    const transformedJobs = serviceJobs.map(transformServiceJobForFrontend);
    res.json(transformedJobs);
  } catch (err) {
    console.error('Error fetching service jobs by technician:', err);
    res.status(500).json({ error: err.message });
  }
}

// Search service jobs
async function searchServiceJobsController(req, res) {
  try {
    const { search, status } = req.query;
    const serviceJobs = await searchServiceJobs(search, status);
    
    // Transform data for frontend
    const transformedJobs = serviceJobs.map(transformServiceJobForFrontend);
    res.json(transformedJobs);
  } catch (err) {
    console.error('Error searching service jobs:', err);
    res.status(500).json({ error: err.message });
  }
}

// Get service job summary
async function fetchServiceJobSummary(req, res) {
  try {
    const summary = await getServiceJobSummary();
    res.json(summary);
  } catch (err) {
    console.error('Error fetching service job summary:', err);
    res.status(500).json({ error: err.message });
  }
}

// Get all technicians with their current job counts
async function fetchTechniciansWithJobCounts(req, res) {
  try {
    const technicians = await getTechniciansWithJobCounts();
    res.json(technicians);
  } catch (err) {
    console.error('Error fetching technicians with job counts:', err);
    res.status(500).json({ error: err.message });
  }
}

// Get technician workload summary
async function fetchTechnicianWorkloadSummary(req, res) {
  try {
    const summary = await getTechnicianWorkloadSummary();
    res.json(summary);
  } catch (err) {
    console.error('Error fetching technician workload summary:', err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  fetchServiceJobs,
  fetchServiceJob,
  createServiceJobController,
  updateServiceJobController,
  deleteServiceJobController,
  updateServiceJobStatusController,
  assignTechnicianController,
  removeTechnicianController,
  fetchServiceJobTechnicians,
  addWorkLogController,
  fetchServiceJobWorkLogs,
  updateWorkLogController,
  deleteWorkLogController,
  fetchServiceJobsByStatus,
  fetchServiceJobsByTechnician,
  searchServiceJobsController,
  fetchServiceJobSummary,
  fetchTechniciansWithJobCounts,
  fetchTechnicianWorkloadSummary
  
};