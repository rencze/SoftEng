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
    getQuotationParts,
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

// Create new quotation - UPDATED to remove isModified field
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
      customerName,
      email,
      phone,
      laborCost = 0,
      discount = 0,
      workTimeEstimation,
      quote,
      validity = 30,
      services = [],
      servicePackages = [],
      customParts = [],
      status = 'Pending' // REMOVED: isModified parameter
    } = req.body;

    console.log('Received quotation data:', {
      customerId,
      customerName,
      status,
      servicesCount: services.length,
      packagesCount: servicePackages.length,
      partsCount: customParts.length
    });

    // FLEXIBLE VALIDATION: either customerId OR guestName/guestContact OR customerName/phone
    if (!customerId && !guestName && !customerName) {
      return res.status(400).json({ 
        error: "Either customerId OR customer name information is required" 
      });
    }

    // Use guestName/guestContact if provided, otherwise use customerName/phone
    const finalGuestName = guestName || customerName;
    const finalGuestContact = guestContact || phone;
    const finalGuestEmail = guestEmail || email;

    // Ensure status is properly set to Pending
    const finalStatus = status || 'Pending';

    const newQuotation = await createQuotation({
      serviceRequestId,
      bookingId,
      technicianId,
      customerId: customerId || null,
      guestName: finalGuestName,
      guestContact: finalGuestContact,
      guestEmail: finalGuestEmail,
      laborCost: parseFloat(laborCost) || 0,
      discount: parseFloat(discount) || 0,
      workTimeEstimation,
      quote,
      validity: parseInt(validity) || 30,
      services,
      servicePackages,
      customParts,
      status: finalStatus
      // REMOVED: isModified field
    });

    console.log('Quotation created successfully:', {
      id: newQuotation.quotationId,
      status: newQuotation.status, // Should now be "Pending"
      quotationNumber: newQuotation.quotationNumber
    });

    res.status(201).json(newQuotation);
  } catch (err) {
    console.error('Error creating quotation:', err);
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

  // Get quotation parts
  async function fetchQuotationParts(req, res) {
    try {
      const quotation = await getQuotationById(req.params.id);
      if (!quotation) return res.status(404).json({ error: "Quotation not found" });

      const parts = await getQuotationParts(req.params.id);
      res.json(parts);
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
    fetchQuotationParts,
    fetchCustomerQuotations,
    fetchTechnicianQuotations,
  };