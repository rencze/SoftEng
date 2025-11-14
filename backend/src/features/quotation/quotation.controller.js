const {
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
} = require("./quotation.model");

// Get all quotations
async function fetchQuotations(req, res) {
  try {
    const quotations = await getAllQuotations();
    res.json(quotations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get single quotation
async function fetchQuotation(req, res) {
  try {
    const quotation = await getQuotationById(req.params.id);
    if (!quotation) return res.status(404).json({ error: "Quotation not found" });
    res.json(quotation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Create new quotation
async function createQuotationController(req, res) {
  try {
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
    } = req.body;

    // Validate: either customerId OR guest information must be provided
    if (!customerId && (!guestName || !guestContact)) {
      return res.status(400).json({ 
        error: "Either customerId OR guestName and guestContact are required" 
      });
    }

    const newQuotation = await createQuotation({
      serviceRequestId,
      bookingId,
      technicianId,
      customerId,
      guestName,
      guestContact,
      guestEmail,
      laborCost,
      partsCost,
      discount,
      workTimeEstimation,
      quote,
      status
    });

    res.status(201).json(newQuotation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Update quotation
async function updateQuotationController(req, res) {
  try {
    const quotation = await getQuotationById(req.params.id);
    if (!quotation) return res.status(404).json({ error: "Quotation not found" });

    const updatedQuotation = await updateQuotation(req.params.id, req.body);
    res.json(updatedQuotation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Delete quotation
async function deleteQuotationController(req, res) {
  try {
    const quotation = await getQuotationById(req.params.id);
    if (!quotation) return res.status(404).json({ error: "Quotation not found" });

    await deleteQuotation(req.params.id);
    res.json({ message: "Quotation deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Approve quotation
async function approveQuotationController(req, res) {
  try {
    const quotation = await getQuotationById(req.params.id);
    if (!quotation) return res.status(404).json({ error: "Quotation not found" });

    const approvedQuotation = await approveQuotation(req.params.id);
    res.json(approvedQuotation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Reject quotation
async function rejectQuotationController(req, res) {
  try {
    const quotation = await getQuotationById(req.params.id);
    if (!quotation) return res.status(404).json({ error: "Quotation not found" });

    const rejectedQuotation = await rejectQuotation(req.params.id);
    res.json(rejectedQuotation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Add service to quotation
async function addServiceController(req, res) {
  try {
    const quotation = await getQuotationById(req.params.id);
    if (!quotation) return res.status(404).json({ error: "Quotation not found" });

    const { serviceId, quantity, price } = req.body;

    if (!serviceId) {
      return res.status(400).json({ error: "Service ID is required" });
    }

    const result = await addServiceToQuotation(req.params.id, {
      serviceId,
      quantity,
      price
    });

    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get quotation services
async function fetchQuotationServices(req, res) {
  try {
    const quotation = await getQuotationById(req.params.id);
    if (!quotation) return res.status(404).json({ error: "Quotation not found" });

    const services = await getQuotationServices(req.params.id);
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Remove service from quotation
async function removeServiceController(req, res) {
  try {
    const quotation = await getQuotationById(req.params.id);
    if (!quotation) return res.status(404).json({ error: "Quotation not found" });

    const { serviceId } = req.body;
    if (!serviceId) {
      return res.status(400).json({ error: "Service ID is required" });
    }

    const result = await removeServiceFromQuotation(req.params.id, serviceId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Add package to quotation
async function addPackageController(req, res) {
  try {
    const quotation = await getQuotationById(req.params.id);
    if (!quotation) return res.status(404).json({ error: "Quotation not found" });

    const { servicePackageId, quantity, price } = req.body;

    if (!servicePackageId) {
      return res.status(400).json({ error: "Service Package ID is required" });
    }

    const result = await addPackageToQuotation(req.params.id, {
      servicePackageId,
      quantity,
      price
    });

    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get quotation packages
async function fetchQuotationPackages(req, res) {
  try {
    const quotation = await getQuotationById(req.params.id);
    if (!quotation) return res.status(404).json({ error: "Quotation not found" });

    const packages = await getQuotationPackages(req.params.id);
    res.json(packages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Remove package from quotation
async function removePackageController(req, res) {
  try {
    const quotation = await getQuotationById(req.params.id);
    if (!quotation) return res.status(404).json({ error: "Quotation not found" });

    const { packageId } = req.body;
    if (!packageId) {
      return res.status(400).json({ error: "Package ID is required" });
    }

    const result = await removePackageFromQuotation(req.params.id, packageId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get quotations by customer
async function fetchCustomerQuotations(req, res) {
  try {
    const { customerId } = req.params;
    const quotations = await getQuotationsByCustomer(customerId);
    res.json(quotations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get quotations by technician
async function fetchTechnicianQuotations(req, res) {
  try {
    const { technicianId } = req.params;
    const quotations = await getQuotationsByTechnician(technicianId);
    res.json(quotations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  fetchQuotations,
  fetchQuotation,
  createQuotationController,
  updateQuotationController,
  deleteQuotationController,
  approveQuotationController,
  rejectQuotationController,
  addServiceController,
  fetchQuotationServices,
  removeServiceController,
  addPackageController,
  fetchQuotationPackages,
  removePackageController,
  fetchCustomerQuotations,
  fetchTechnicianQuotations,
};