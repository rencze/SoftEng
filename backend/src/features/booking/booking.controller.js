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

// 🟤 Block a technician for a specific slot
async function blockTechnician(req, res) {
  try {
    const { technicianId, timeSlotId } = req.body;
    if (!technicianId || !timeSlotId)
      return res.status(400).json({ message: "Missing technicianId or timeSlotId" });

    await BookingModel.updateTechnicianAvailabilityModel(technicianId, timeSlotId, false);
    res.json({ message: "Technician blocked successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// 🟤 Unblock a technician for a specific slot
async function unblockTechnician(req, res) {
  try {
    const { technicianId, timeSlotId } = req.body;
    if (!technicianId || !timeSlotId)
      return res.status(400).json({ message: "Missing technicianId or timeSlotId" });

    await BookingModel.updateTechnicianAvailabilityModel(technicianId, timeSlotId, true);
    res.json({ message: "Technician unblocked successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}


// 🟢 Get technician availability by technician and date
async function getTechnicianAvailabilityByTechnician(req, res) {
  try {
    const { technicianId, date } = req.query;

    if (!technicianId || !date) {
      return res.status(400).json({ message: "Missing technicianId or date" });
    }

    const availability = await BookingModel.getTechnicianAvailabilityByTechnicianModel(
      technicianId,
      date
    );

    res.json(availability);
  } catch (err) {
    console.error("Error fetching technician availability:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// 🟪 Reschedule existing booking
async function rescheduleBooking(req, res) {
  try {
    const { id } = req.params;
    const { timeSlotId, technicianId, rescheduledDate } = req.body;

    if (!timeSlotId || !technicianId || !rescheduledDate) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const updatedData = {
      timeSlotId,
      technicianId,
      bookingDate: rescheduledDate,
      statusId: 4, // 4 = "Rescheduled"
    };

    const result = await BookingModel.updateBookingModel(id, updatedData);
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Booking not found" });

    res.json({ message: "Booking rescheduled successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
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
  blockTechnician,
  unblockTechnician,
  getTechnicianAvailabilityByTechnician,
    rescheduleBooking, 
};

// 🟢 Create booking
// async function createBooking(req, res) {
//   try {
//     const { customerId, technicianId, timeSlotId, notes } = req.body;

//     // ⚙️ Toggle restriction ON/OFF
//     const ENFORCE_SINGLE_ACTIVE_BOOKING = false; // 🔴 change to true later for production

//     if (ENFORCE_SINGLE_ACTIVE_BOOKING) {
//       const hasActive = await BookingModel.hasActiveBooking(customerId);
//       if (hasActive) {
//         return res.status(400).json({
//           message: "You already have an active booking (Pending/Confirmed/Rescheduled).",
//         });
//       }
//     }

//     const booking = await BookingModel.createBookingModel({
//       customerId,
//       technicianId,
//       timeSlotId,
//       notes,
//     });

//     res.status(201).json({ message: "Booking created successfully", booking });
//   } catch (err) {
//     console.error("Error creating booking:", err);
//     res.status(500).json({ error: err.message });
//   }
// }


// ✅ Step 3: Behavior Summary
// Mode	ENFORCE_SINGLE_ACTIVE_BOOKING	Behavior
// 🧪 Testing	false	Allows unlimited bookings
// 🚀 Production	true	Blocks new booking if user already has active one
// ✅ Step 4: (Optional) — You Can Log a Warning for Testing

// If you want to be reminded that validation is off:

// if (!ENFORCE_SINGLE_ACTIVE_BOOKING) {
//   console.warn("⚠️ Booking restriction is currently DISABLED (testing mode)");
// }

// 🔁 Summary of What You Did

// Added a helper hasActiveBooking(customerId) in model.

// Updated controller to optionally enforce the rule.

// Controlled behavior with one flag: ENFORCE_SINGLE_ACTIVE_BOOKING.