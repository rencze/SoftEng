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
  getServiceJobsByTechnician
} = require("./serviceJob.model");

// Get all service jobs
async function fetchServiceJobs(req, res) {
  try {
    const serviceJobs = await getAllServiceJobs();
    res.json(serviceJobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get single service job
async function fetchServiceJob(req, res) {
  try {
    const serviceJob = await getServiceJobById(req.params.id);
    if (!serviceJob) return res.status(404).json({ error: "Service job not found" });
    res.json(serviceJob);
  } catch (err) {
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

    res.status(201).json(newServiceJob);
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
    res.json(updatedServiceJob);
  } catch (err) {
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
    res.status(500).json({ error: err.message });
  }
}

// Update service job status
async function updateServiceJobStatusController(req, res) {
  try {
    const serviceJob = await getServiceJobById(req.params.id);
    if (!serviceJob) return res.status(404).json({ error: "Service job not found" });

    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    const validStatuses = ['Checked In', 'Repair', 'Testing', 'Completion'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const updatedServiceJob = await updateServiceJobStatus(req.params.id, status);
    res.json(updatedServiceJob);
  } catch (err) {
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
    res.status(500).json({ error: err.message });
  }
}

// Add work log to service job
async function addWorkLogController(req, res) {
  try {
    const serviceJob = await getServiceJobById(req.params.id);
    if (!serviceJob) return res.status(404).json({ error: "Service job not found" });

    const { workDescription, remarks } = req.body;

    if (!workDescription) {
      return res.status(400).json({ error: "workDescription is required" });
    }

    const result = await addWorkLogToJob(req.params.id, {
      workDescription,
      remarks
    });

    res.status(201).json(result);
  } catch (err) {
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
    res.status(500).json({ error: err.message });
  }
}

// Get service jobs by status
async function fetchServiceJobsByStatus(req, res) {
  try {
    const { status } = req.params;
    const serviceJobs = await getServiceJobsByStatus(status);
    res.json(serviceJobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get service jobs by technician
async function fetchServiceJobsByTechnician(req, res) {
  try {
    const { technicianId } = req.params;
    const serviceJobs = await getServiceJobsByTechnician(technicianId);
    res.json(serviceJobs);
  } catch (err) {
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
  fetchServiceJobsByTechnician
};