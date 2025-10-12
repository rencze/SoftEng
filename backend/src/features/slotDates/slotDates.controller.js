// slotDates.controller.js
const SlotModel = require("./slotDates.model");
const { updateSlotDateAndCascade } = require("./slotDates.model");

// --- SlotDate Controllers ---

// Update slotDate with cascade (block/unblock day and its time slots)
async function updateSlotDateCascade(req, res) {
  try {
    const slotDateId = req.params.id;
    const { slotDate, isOpen } = req.body;

    const result = await updateSlotDateAndCascade(slotDateId, { slotDate, isOpen });

    res.json({
      message: `Slot date ${isOpen ? "opened" : "blocked"} successfully, all related time slots updated.`,
      result,
    });
  } catch (err) {
    console.error("Cascade update error:", err);
    res.status(500).json({ error: "Failed to update slot date and cascade changes" });
  }
}

async function getAllSlotDates(req, res) {
  try {
    const slotDates = await SlotModel.getAllSlotDatesModel();
    res.json(slotDates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getSlotDateById(req, res) {
  try {
    const { id } = req.params;
    const slotDate = await SlotModel.getSlotDateByIdModel(id);
    if (!slotDate) return res.status(404).json({ message: "Slot date not found" });
    res.json(slotDate);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getSlotDateByDate(req, res) {
  try {
    const { date } = req.params;
    const slotDate = await SlotModel.getSlotDateByDateModel(date);
    if (!slotDate) return res.status(404).json({ message: "Slot date not found" });
    res.json(slotDate);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function createSlotDate(req, res) {
  try {
    const result = await SlotModel.createSlotDateModel(req.body);
    res.status(201).json({ message: "Slot date created", slotDate: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateSlotDate(req, res) {
  try {
    const { id } = req.params;
    const result = await SlotModel.updateSlotDateModel(id, req.body);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Slot date not found" });
    res.json({ message: "Slot date updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function deleteSlotDate(req, res) {
  try {
    const { id } = req.params;
    const result = await SlotModel.deleteSlotDateModel(id);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Slot date not found" });
    res.json({ message: "Slot date deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// --- TimeSlot Controllers ---
async function getTimeSlotsBySlotDateId(req, res) {
  try {
    const { id } = req.params;
    const slots = await SlotModel.getTimeSlotsBySlotDateIdModel(id);
    res.json(slots);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function createTimeSlot(req, res) {
  try {
    const result = await SlotModel.createTimeSlotModel(req.body);
    res.status(201).json({ message: "Time slot created", timeSlot: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateTimeSlot(req, res) {
  try {
    const { id } = req.params;
    const { startTime, endTime, isAvailable } = req.body;
    const result = await SlotModel.updateTimeSlotModel(id, startTime, endTime, isAvailable);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Time slot not found" });
    res.json({ message: "Time slot updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateTimeSlotAvailability(req, res) {
  try {
    const { id } = req.params;
    const { isAvailable } = req.body;
    const result = await SlotModel.updateTimeSlotAvailabilityModel(id, isAvailable);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Time slot not found" });
    res.json({ message: "Time slot availability updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function deleteTimeSlot(req, res) {
  try {
    const { id } = req.params;
    const result = await SlotModel.deleteTimeSlotModel(id);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Time slot not found" });
    res.json({ message: "Time slot deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// --- Combined helper: get slots by date for frontend ---
async function getSlotsByDate(req, res) {
  try {
    const { date } = req.params;
    const slotDate = await SlotModel.getSlotDateByDateModel(date);
    if (!slotDate) return res.status(404).json({ message: "Slot date not found" });

    const slots = await SlotModel.getTimeSlotsBySlotDateIdModel(slotDate.slotDateId);
    res.json(slots);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// --- Get all technicians and availability for a specific time slot ---
async function getTechniciansByTimeSlot(req, res) {
  try {
    const { timeSlotId } = req.params;
    const technicians = await SlotModel.getTechniciansWithAvailabilityBySlot(timeSlotId);

    res.json(technicians);
  } catch (err) {
    console.error("Error fetching technician availability:", err);
    res.status(500).json({ error: "Failed to fetch technician availability" });
  }
}

module.exports = {
  getAllSlotDates,
  getSlotDateById,
  getSlotDateByDate,
  getSlotsByDate,
  createSlotDate,
  updateSlotDate, // normal update
  updateSlotDateCascade, // cascade update (open/block day)
  deleteSlotDate,

  // TimeSlot exports
  getTimeSlotsBySlotDateId,
  createTimeSlot,
  updateTimeSlot,
  updateTimeSlotAvailability,
  deleteTimeSlot,
  getTechniciansByTimeSlot
};

