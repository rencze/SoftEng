const BookingModel = require("./booking.model");

// 🟩 Get all bookings
async function getAllBookings(req, res) {
  try {
    const bookings = await BookingModel.getAllBookingsModel();
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// 🟦 Get booking by ID
async function getBookingById(req, res) {
  try {
    const { id } = req.params;
    const booking = await BookingModel.getBookingByIdModel(id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// 🟢 Create booking
async function createBooking(req, res) {
  try {
    const booking = await BookingModel.createBookingModel(req.body);
    res.status(201).json({ message: "Booking created successfully", booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// 🟨 Update booking info
async function updateBooking(req, res) {
  try {
    const { id } = req.params;
    const result = await BookingModel.updateBookingModel(id, req.body);
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Booking not found" });
    res.json({ message: "Booking updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// 🟥 Delete booking
async function deleteBooking(req, res) {
  try {
    const { id } = req.params;
    const result = await BookingModel.deleteBookingModel(id);
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Booking not found" });
    res.json({ message: "Booking deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// 🟧 Update booking status
async function updateBookingStatus(req, res) {
  try {
    const { id } = req.params;
    const { statusId, changedBy, remarks } = req.body;
    const result = await BookingModel.updateBookingStatusModel(id, statusId, changedBy, remarks);
    res.json({ message: "Booking status updated successfully", result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// 🟪 Get booking history
async function getBookingHistory(req, res) {
  try {
    const { id } = req.params;
    const history = await BookingModel.getBookingHistoryModel(id);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// 🟠 Fetch booked technicians per slot & date
async function fetchBookedTechnicians(req, res) {
  try {
    const { timeSlotId } = req.params;
    const { date } = req.query;

    if (!timeSlotId || !date) return res.json([]);

    const bookedTechIds = await BookingModel.getBookedTechniciansBySlotAndDate(timeSlotId, date);
    res.json(bookedTechIds);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

// 🟣 Fetch all slots with booked technicians for a date
async function getSlotsWithBookedTechnicians(req, res) {
  try {
    const { date } = req.params;
    const slots = await BookingModel.getSlotsWithBookedTechniciansByDateModel(date);
    res.json(slots);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch slots with booked technicians" });
  }
}

// 🟢 Get technicians availability (for given date + timeSlot)
async function getTechnicianAvailability(req, res) {
  try {
    const { date, timeSlotId } = req.query;

    if (!date || !timeSlotId)
      return res.status(400).json({ message: "Missing date or timeSlotId" });

    const technicians = await BookingModel.getTechnicianAvailabilityBySlotModel(date, timeSlotId);
    res.json(technicians);
  } catch (err) {
    console.error("Error fetching technician availability:", err);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
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
};