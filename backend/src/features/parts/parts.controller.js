const {
  getAllParts,
  getPartById,
  createPart,
  updatePart,
  deletePart
} = require("./parts.model");

// Get all parts
async function fetchParts(req, res) {
  try {
    const parts = await getAllParts();
    res.json(parts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get single part
async function fetchPart(req, res) {
  try {
    const part = await getPartById(req.params.id);
    if (!part) return res.status(404).json({ error: "Part not found" });
    res.json(part);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Create new part
async function createPartController(req, res) {
  try {
    const { partName, partDescription, unitPrice, quantity } = req.body;
    if (!partName || !unitPrice) {
      return res.status(400).json({ error: "Part name and unit price are required" });
    }
    const newPart = await createPart({ partName, partDescription, unitPrice, quantity });
    res.status(201).json(newPart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Update part
async function updatePartController(req, res) {
  try {
    const part = await getPartById(req.params.id);
    if (!part) return res.status(404).json({ error: "Part not found" });

    const { partName, partDescription, unitPrice, quantity } = req.body;
    const updatedPart = await updatePart(req.params.id, { partName, partDescription, unitPrice, quantity });
    res.json(updatedPart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Delete part
async function deletePartController(req, res) {
  try {
    const part = await getPartById(req.params.id);
    if (!part) return res.status(404).json({ error: "Part not found" });

    await deletePart(req.params.id);
    res.json({ message: "Part deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  fetchParts,
  fetchPart,
  createPartController,
  updatePartController,
  deletePartController,
};
