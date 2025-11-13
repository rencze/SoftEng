const express = require("express");
const router = express.Router();
const {
  getAllServiceRequestBookings,
  getServiceRequestBookingById,
  createServiceRequestBooking,
  updateServiceRequestBooking,
  deleteServiceRequestBooking,
  updateServiceRequestBookingStatus,
  getServiceRequestBookingHistory,
  fetchServiceRequestBookedTechnicians,
  getServiceRequestSlotsWithBookedTechnicians,
  getServiceRequestTechnicianAvailability,
  getServiceRequestTechnicianAvailabilityByTechnician,
  rescheduleServiceRequestBooking,
} = require("./serviceRequestBooking.controller");

// 🟠 Service Request Technicians availability
router.get("/availability", getServiceRequestTechnicianAvailability);
router.get("/booked-technicians/:timeSlotId", fetchServiceRequestBookedTechnicians);
router.get("/slots-with-booked/:date", getServiceRequestSlotsWithBookedTechnicians);
router.get("/availability/by-technician", getServiceRequestTechnicianAvailabilityByTechnician);

// 🟩 Service Request Bookings CRUD
router.get("/", getAllServiceRequestBookings);
router.get("/:id", getServiceRequestBookingById);
router.post("/", createServiceRequestBooking);
router.put("/:id", updateServiceRequestBooking);
router.delete("/:id", deleteServiceRequestBooking);
router.put("/reschedule/:id", rescheduleServiceRequestBooking);

// 🟧 Status & history
router.patch("/:id/status", updateServiceRequestBookingStatus);
router.get("/:id/history", getServiceRequestBookingHistory);

module.exports = router;