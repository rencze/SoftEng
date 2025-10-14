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
  getTechnicianAvailability,
} = require("./booking.controller");

// 🟠 Technicians availability
router.get("/availability", getTechnicianAvailability);
router.get("/booked-technicians/:timeSlotId", fetchBookedTechnicians);
router.get("/slots-with-booked/:date", getSlotsWithBookedTechnicians);

// 🟩 Bookings CRUD
router.get("/", getAllBookings);
router.get("/:id", getBookingById);
router.post("/", createBooking);
router.put("/:id", updateBooking);
router.delete("/:id", deleteBooking);

// 🟧 Status & history
router.patch("/:id/status", updateBookingStatus);
router.get("/:id/history", getBookingHistory);


// // 🟩 Bookings CRUD
// router.get("/", getAllBookings);
// router.get("/:id", getBookingById);
// router.post("/", createBooking);
// router.put("/:id", updateBooking);
// router.delete("/:id", deleteBooking);

// // 🟧 Status & history
// router.patch("/:id/status", updateBookingStatus);
// router.get("/:id/history", getBookingHistory);

// // 🟠 Technicians availability
// // 🟢 Technician availability (new endpoint)
// router.get("/availability", getTechnicianAvailability);
// router.get("/booked-technicians/:timeSlotId", fetchBookedTechnicians);
// router.get("/slots-with-booked/:date", getSlotsWithBookedTechnicians);

module.exports = router;