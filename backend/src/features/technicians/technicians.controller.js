const { getAllTechnicians, addTechnician, removeTechnician, getTechniciansWithAvailability } = require("./technicians.model");

// Fetch all technicians
async function fetchTechnicians(_req, res) {
  try {
    const technicians = await getAllTechnicians();
    res.json(technicians); // only essential fields
  } catch (err) {
    console.error("Fetch technicians error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// Add technician manually
async function addTechnicianController(req, res) {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: "userId is required" });

    const result = await addTechnician(userId);
    res.status(201).json({ message: "Technician added successfully", result });
  } catch (err) {
    console.error("Add technician error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// Remove technician manually
async function removeTechnicianController(req, res) {
  try {
    const { userId } = req.params;
    const result = await removeTechnician(userId);
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Technician not found" });

    res.json({ message: "Technician removed successfully" });
  } catch (err) {
    console.error("Remove technician error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// Fetch all technicians with availability for a specific slot
async function fetchTechniciansForSlot(req, res) {
  try {
    const { date, timeSlotId } = req.query;
    if (!date || !timeSlotId)
      return res.status(400).json({ message: "date and timeSlotId are required" });

    const technicians = await getTechniciansWithAvailability(date, timeSlotId);
    res.json(technicians);
  } catch (err) {
    console.error("Fetch technicians for slot error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = { fetchTechnicians, addTechnicianController, removeTechnicianController, fetchTechniciansForSlot };
