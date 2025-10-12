

const pool = require("../../config/db");

// --- Get all bookings with customer & technician names ---
async function getAllBookingsModel() {
  const [rows] = await pool.query(`
    SELECT 
      b.*,
      bs.statusName,
      CONCAT(cu.firstName, ' ', cu.lastName) AS customerName,
      CONCAT(tu.firstName, ' ', tu.lastName) AS technicianName,
      ts.startTime,
      ts.endTime
    FROM booking b
    LEFT JOIN bookingStatus bs ON b.statusId = bs.id
    LEFT JOIN customers c ON b.customerId = c.customerId
    LEFT JOIN users cu ON c.userId = cu.userId
    LEFT JOIN technicians t ON b.technicianId = t.technicianId
    LEFT JOIN users tu ON t.userId = tu.userId
    LEFT JOIN timeSlot ts ON b.timeSlotId = ts.timeSlotId
    ORDER BY b.createdAt DESC
  `);
  return rows;
}

// Get booking by ID
async function getBookingByIdModel(bookingId) {
  const [rows] = await pool.query(
    `
    SELECT 
      b.*,
      bs.statusName,
      CONCAT(cu.firstName, ' ', cu.lastName) AS customerName,
      CONCAT(tu.firstName, ' ', tu.lastName) AS technicianName,
      ts.startTime,
      ts.endTime
    FROM booking b
    LEFT JOIN bookingStatus bs ON b.statusId = bs.id
    LEFT JOIN customers c ON b.customerId = c.customerId
    LEFT JOIN users cu ON c.userId = cu.userId
    LEFT JOIN technicians t ON b.technicianId = t.technicianId
    LEFT JOIN users tu ON t.userId = tu.userId
    LEFT JOIN timeSlot ts ON b.timeSlotId = ts.timeSlotId
    WHERE b.bookingId = ?
    `,
    [bookingId]
  );
  return rows[0];
}

async function createBookingModel({ customerId, technicianId, timeSlotId, notes }) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1️⃣ Lock the row for this technician + slot
    const [existing] = await conn.query(
      `SELECT * FROM booking WHERE technicianId = ? AND timeSlotId = ? FOR UPDATE`,
      [technicianId, timeSlotId]
    );

    if (existing.length > 0) {
      throw new Error("Technician is already booked at this time");
    }

    // 2️⃣ Insert booking
    const [result] = await conn.query(
      `INSERT INTO booking (customerId, technicianId, timeSlotId, notes, statusId)
       VALUES (?, ?, ?, ?, ?)`,
      [customerId, technicianId, timeSlotId, notes || null, 1] // statusId 1 = Pending
    );

    const bookingId = result.insertId;

    // 3️⃣ Add booking history
    await conn.query(
      `INSERT INTO bookingHistory (bookingId, statusId, remarks)
       VALUES (?, ?, ?)`,
      [bookingId, 1, "Booking created (Pending)"]
    );

    await conn.commit();

    return {
      bookingId,
      customerId,
      technicianId,
      timeSlotId,
      notes,
      statusId: 1,
    };
  } catch (err) {
    await conn.rollback();

    if (err.code === "ER_DUP_ENTRY") {
      throw new Error("This technician is already booked for this time slot");
    }

    throw err;
  } finally {
    conn.release();
  }
}


// ✅ Create booking with time slot lock and constraint handling
// 11 PM
// async function createBookingModel({ customerId, technicianId, timeSlotId, notes }) {
//   const conn = await pool.getConnection();
//   try {
//     await conn.beginTransaction();

//     //  Lock the time slot row so others wait until this transaction finishes
//     const [slotRows] = await conn.query(
//       "SELECT isAvailable FROM timeSlot WHERE timeSlotId = ? FOR UPDATE",
//       [timeSlotId]
//     );

//     if (!slotRows.length) throw new Error("Time slot not found");
//     if (!slotRows[0].isAvailable) throw new Error("Time slot is already booked");

//     //  Insert booking
//     const [result] = await conn.query(
//       `INSERT INTO booking (customerId, technicianId, timeSlotId, notes, statusId)
//        VALUES (?, ?, ?, ?, ?)`,
//       [customerId, technicianId || null, timeSlotId, notes || null, 1]
//     );
//     const bookingId = result.insertId;

//     //  Mark slot unavailable AFTER insert succeeds
//     await conn.query("UPDATE timeSlot SET isAvailable = 0 WHERE timeSlotId = ?", [timeSlotId]);

//     //  Add booking history
//     await conn.query(
//       `INSERT INTO bookingHistory (bookingId, statusId, remarks)
//        VALUES (?, ?, ?)`,
//       [bookingId, 1, "Booking created (Pending)"]
//     );

//     await conn.commit();
//     return { bookingId, customerId, technicianId, timeSlotId, notes, statusId: 1 };
//   } catch (err) {
//     await conn.rollback();

//     //  Handle MySQL duplicate entry error from unique constraint
//     if (err.code === "ER_DUP_ENTRY") {
//       throw new Error("This time slot is already booked. Please choose another.");
//     }

//     throw err;
//   } finally {
//     conn.release();
//   }
// }

// Update booking
async function updateBookingModel(bookingId, { technicianId, timeSlotId, notes }) {
  const [result] = await pool.query(
    `UPDATE booking SET technicianId = ?, timeSlotId = ?, notes = ? WHERE bookingId = ?`,
    [technicianId || null, timeSlotId, notes || null, bookingId]
  );
  return result;
}

// Delete booking
async function deleteBookingModel(bookingId) {
  const [result] = await pool.query(`DELETE FROM booking WHERE bookingId = ?`, [bookingId]);
  return result;
}

// Update booking status + history
async function updateBookingStatusModel(bookingId, statusId, changedBy, remarks) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(
      `UPDATE booking SET statusId = ? WHERE bookingId = ?`,
      [statusId, bookingId]
    );

    await conn.query(
      `INSERT INTO bookingHistory (bookingId, statusId, changedBy, remarks)
       VALUES (?, ?, ?, ?)`,
      [bookingId, statusId, changedBy || null, remarks || "Status updated"]
    );

    await conn.commit();
    return { bookingId, statusId, remarks };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

// Get booking history
async function getBookingHistoryModel(bookingId) {
  const [rows] = await pool.query(
    `
    SELECT 
      bh.*,
      bs.statusName,
      CONCAT(u.firstName, ' ', u.lastName) AS changedByName
    FROM bookingHistory bh
    LEFT JOIN bookingStatus bs ON bh.statusId = bs.id
    LEFT JOIN users u ON bh.changedBy = u.userId
    WHERE bh.bookingId = ?
    ORDER BY bh.changedAt DESC
    `,
    [bookingId]
  );
  return rows;
}

// Get booked technicians for a specific time slot and date
async function getBookedTechniciansBySlot(timeSlotId) {
  const [rows] = await pool.query(
    `SELECT technicianId FROM booking WHERE timeSlotId = ?`,
    [timeSlotId]
  );
  return rows.map(r => r.technicianId);
}

// Get slots for a date along with booked technicians
async function getSlotsWithBookedTechniciansByDateModel(date) {
  const [slotDateRows] = await pool.query(
    "SELECT * FROM slotDate WHERE slotDate = ?",
    [date]
  );
  const slotDate = slotDateRows[0];
  if (!slotDate) return [];

  // Fetch all timeSlots for that slotDate
  const [slots] = await pool.query(
    `
    SELECT 
      ts.timeSlotId,
      ts.startTime,
      ts.endTime,
      ts.isAvailable,
      GROUP_CONCAT(b.technicianId) AS bookedTechnicians
    FROM timeSlot ts
    LEFT JOIN booking b
      ON b.timeSlotId = ts.timeSlotId
      AND DATE(b.createdAt) = ?
    WHERE ts.slotDateId = ?
    GROUP BY ts.timeSlotId
    ORDER BY ts.startTime ASC
    `,
    [date, slotDate.slotDateId]
  );

  // Convert bookedTechnicians from CSV string to array
  slots.forEach(slot => {
    slot.bookedTechnicians = slot.bookedTechnicians
      ? slot.bookedTechnicians.split(",").map(Number)
      : [];
  });

  return slots;
}



module.exports = {
  getAllBookingsModel,
  getBookingByIdModel,
  createBookingModel,
  updateBookingModel,
  deleteBookingModel,
  updateBookingStatusModel,
  getBookingHistoryModel,
  getBookedTechniciansBySlot,
  getSlotsWithBookedTechniciansByDateModel,
};


