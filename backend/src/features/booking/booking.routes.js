const express = require("express");
const router = express.Router();
const {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking,
  updateBookingStatus,
  getBookingHistory,
  fetchBookedTechnicians,
  getSlotsWithBookedTechnicians,
} = require("./booking.controller");

// Booking CRUD
router.get("/booked-technicians/:timeSlotId", fetchBookedTechnicians);

router.get("/", getAllBookings);
router.get("/:id", getBookingById);
router.post("/", createBooking);
router.put("/:id", updateBooking);
router.delete("/:id", deleteBooking);
router.get("/slots-with-booked/:date", getSlotsWithBookedTechnicians);

// Booking status & history
router.patch("/:id/status", updateBookingStatus);
router.get("/:id/history", getBookingHistory);


module.exports = router;
