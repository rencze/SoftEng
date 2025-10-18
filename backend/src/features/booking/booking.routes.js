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
    blockTechnician, 
    unblockTechnician,
    getTechnicianAvailabilityByTechnician
  } = require("./booking.controller");

  // 🟠 Technicians availability
  router.get("/availability", getTechnicianAvailability);
  router.get("/booked-technicians/:timeSlotId", fetchBookedTechnicians);
  router.get("/slots-with-booked/:date", getSlotsWithBookedTechnicians);
  router.get("/availability/by-technician", getTechnicianAvailabilityByTechnician);
  

  // 🟩 Bookings CRUD
  router.get("/", getAllBookings);
  router.get("/:id", getBookingById);
  router.post("/", createBooking);
  router.put("/:id", updateBooking);
  router.delete("/:id", deleteBooking);

  // 🟨 Block/Unblock technicians
  router.post("/technicians/block", blockTechnician);
  router.post("/technicians/unblock", unblockTechnician);

  // 🟧 Status & history
  router.patch("/:id/status", updateBookingStatus);
  router.get("/:id/history", getBookingHistory);

  module.exports = router;