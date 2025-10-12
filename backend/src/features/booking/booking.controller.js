
const BookingModel = require("./booking.model");
const pool = require("../../config/db");
// Get all bookings
async function getAllBookings(req, res) {
  try {
    const bookings = await BookingModel.getAllBookingsModel();
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get single booking
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


// Create new booking
async function createBooking(req, res) {
  try {
    const booking = await BookingModel.createBookingModel(req.body);
    res.status(201).json({ message: "Booking created successfully", booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Update booking info
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

// Delete booking
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

// Update booking status
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

// Get booking history
async function getBookingHistory(req, res) {
  try {
    const { id } = req.params;
    const history = await BookingModel.getBookingHistoryModel(id);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /api/bookings/booked-technicians/:timeSlotId?date=YYYY-MM-DD
async function fetchBookedTechnicians(req, res) {
  try {
    const { timeSlotId } = req.params;
    const { date } = req.query; // fetch date from query

    if (!timeSlotId || !date) return res.json([]);

    const [rows] = await pool.query(
      `SELECT technicianId
       FROM booking
       WHERE timeSlotId = ? AND DATE(createdAt) = ?`,
      [timeSlotId, date]
    );

    const bookedTechIds = rows.map(r => r.technicianId);
    res.json(bookedTechIds);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}



// // GET /api/bookings/booked-technicians/:timeSlotId
// async function fetchBookedTechnicians(req, res) {
//   try {
//     const { timeSlotId } = req.params;
//     const bookedTechIds = await BookingModel.getBookedTechniciansBySlot(timeSlotId);
//     res.json(bookedTechIds);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// }

// GET /api/slot-dates/slots-with-booked/:date
async function getSlotsWithBookedTechnicians(req, res) {
  try {
    const { date } = req.params;
    const slots = await SlotModel.getSlotsWithBookedTechniciansByDateModel(date);
    res.json(slots);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch slots with booked technicians" });
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
};
