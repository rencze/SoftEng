const {
  getAllPackagesModel,
  getPackageByIdModel,
  createPackageModel,
  updatePackageModel,
  deletePackageModel,
} = require("./servicePackages.model");

// Get all
async function getAllPackages(req, res) {
  try {
    const packages = await getAllPackagesModel();
    res.json(packages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get one
async function getPackageById(req, res) {
  try {
    const { id } = req.params;
    const servicePackage = await getPackageByIdModel(id);
    if (!servicePackage) return res.status(404).json({ message: "Package not found" });
    res.json(servicePackage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Create
async function createPackage(req, res) {
  try {
    const result = await createPackageModel(req.body);
    res.status(201).json({ message: "Package created", package: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Update
async function updatePackage(req, res) {
  try {
    const { id } = req.params;
    const result = await updatePackageModel(id, req.body);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Package not found" });
    res.json({ message: "Package updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Delete
async function deletePackage(req, res) {
  try {
    const { id } = req.params;
    const result = await deletePackageModel(id);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Package not found" });
    res.json({ message: "Package deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getAllPackages,
  getPackageById,
  createPackage,
  updatePackage,
  deletePackage,
};