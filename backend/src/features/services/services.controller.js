const {
  getAllServicesModel,
  getServiceByIdModel,
  createServiceModel,
  updateServiceModel,
  deleteServiceModel,
} = require("./services.model");

// Get all
async function getAllServices(req, res) {
  try {
    const services = await getAllServicesModel();
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get one
async function getServiceById(req, res) {
  try {
    const { id } = req.params;
    const service = await getServiceByIdModel(id);
    if (!service) return res.status(404).json({ message: "Service not found" });
    res.json(service);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Create
async function createService(req, res) {
  try {
    const result = await createServiceModel(req.body);
    res.status(201).json({ message: "Service created", service: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Update
async function updateService(req, res) {
  try {
    const { id } = req.params;
    const result = await updateServiceModel(id, req.body);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Service not found" });
    res.json({ message: "Service updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Delete
async function deleteService(req, res) {
  try {
    const { id } = req.params;
    const result = await deleteServiceModel(id);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Service not found" });
    res.json({ message: "Service deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
};