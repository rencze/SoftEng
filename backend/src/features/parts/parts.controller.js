  const {
    getAllParts,
    getPartById,
    createPart,
    updatePart,
    deletePart,
    getAllPartsHistory,
    getPartHistoryByPartId,
    stockInPart,
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

      const newPart = await createPart({
        partName,
        partDescription,
        unitPrice,
        quantity,
      });

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

      const { partName, partDescription, unitPrice, quantity, remarks, technicianId } = req.body;

      const updatedPart = await updatePart(req.params.id, {
        partName,
        partDescription,
        unitPrice,
        quantity,
        remarks,
        technicianId,
      });

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

  // Stock-in part
async function stockInPartController(req, res) {
  try {
    const part = await getPartById(req.params.id);
    if (!part) return res.status(404).json({ error: "Part not found" });

    const { quantityToAdd, remarks, technicianId } = req.body;

    if (!quantityToAdd || quantityToAdd <= 0) {
      return res.status(400).json({ error: "Valid quantity to add is required" });
    }

    const updatedPart = await stockInPart(req.params.id, {
      quantityToAdd,
      remarks,
      technicianId,
    });

    res.json(updatedPart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Bulk stock-in parts
async function bulkStockInController(req, res) {
  try {
    const { items, remarks, technicianId } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Items array is required" });
    }

    const results = [];
    
    for (const item of items) {
      const { partId, quantityToAdd } = item;
      
      if (!partId || !quantityToAdd || quantityToAdd <= 0) {
        continue; // Skip invalid items
      }

      try {
        const updatedPart = await stockInPart(partId, {
          quantityToAdd,
          remarks: remarks || `Bulk stock-in of ${quantityToAdd} units`,
          technicianId,
        });
        results.push(updatedPart);
      } catch (err) {
        console.error(`Failed to stock in part ${partId}:`, err);
        results.push({ partId, error: err.message });
      }
    }

    res.json({ 
      message: `Processed ${items.length} items`,
      results 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}


  // ✅ Fetch history for a specific part
  async function fetchPartHistory(req, res) {
    try {
      const history = await getPartHistoryByPartId(req.params.id);
      res.json(history);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // ✅ Fetch all parts history
  async function fetchAllHistory(req, res) {
    try {
      console.log('Fetching all parts history...');
      const history = await getAllPartsHistory();
      console.log(`Found ${history.length} history records`);
      res.json(history);
    } catch (err) {
      console.error('Error in fetchAllHistory:', err);
      res.status(500).json({ error: err.message });
    }
  }

  module.exports = {
    fetchParts,
    fetchPart,
    createPartController,
    updatePartController,
    deletePartController,
      stockInPartController, // Add this
  bulkStockInController, // Add this
    fetchPartHistory,
    fetchAllHistory,
  };
