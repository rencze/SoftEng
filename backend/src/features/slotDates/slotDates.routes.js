const express = require("express");
const router = express.Router();
const {
  getSlotsByDate,
  getAllSlotDates,
  getSlotDateById,
  getSlotDateByDate,
  createSlotDate,
  updateSlotDate,
  updateSlotDateCascade,
  deleteSlotDate,
  getTimeSlotsBySlotDateId,
  createTimeSlot,
  updateTimeSlot,
  updateTimeSlotAvailability,
  deleteTimeSlot,
} = require("./slotDates.controller");

// --- SlotDate Routes ---
router.get("/", getAllSlotDates);
router.get("/id/:id", getSlotDateById);
router.get("/date/:date", getSlotDateByDate);
router.get("/slots/:date", getSlotsByDate);
router.post("/", createSlotDate);

// Normal update (rename route to avoid collision)
router.put("/update/:id", updateSlotDate);

// Cascade open/block
router.patch("/cascade/:id", updateSlotDateCascade);

router.delete("/:id", deleteSlotDate);

// --- TimeSlot Routes ---
router.get("/:id/time-slots", getTimeSlotsBySlotDateId);
router.post("/time-slot", createTimeSlot);
router.put("/time-slot/:id", updateTimeSlot);
router.patch("/time-slot/:id", updateTimeSlotAvailability);
router.delete("/time-slot/:id", deleteTimeSlot);

module.exports = router;

