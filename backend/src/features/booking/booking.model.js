const pool = require("../../config/db");

// 🟩 Get all bookings with joined info
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

// 🟦 Get booking by ID
async function getBookingByIdModel(bookingId) {
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
    WHERE b.bookingId = ?
  `, [bookingId]);
  return rows[0];
}

// 🟩 Create booking
async function createBookingModel({ customerId, technicianId, timeSlotId, notes }) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Ensure tech not double-booked
    const [existing] = await conn.query(
      `SELECT * FROM booking WHERE technicianId = ? AND timeSlotId = ? FOR UPDATE`,
      [technicianId, timeSlotId]
    );

    if (existing.length > 0)
      throw new Error("Technician is already booked at this time");

    // Create booking
    const [result] = await conn.query(
      `INSERT INTO booking (customerId, technicianId, timeSlotId, notes, statusId)
       VALUES (?, ?, ?, ?, ?)`,
      [customerId, technicianId, timeSlotId, notes || null, 1]
    );

    const bookingId = result.insertId;

    // Log history
    await conn.query(
      `INSERT INTO bookingHistory (bookingId, statusId, remarks)
       VALUES (?, ?, ?)`,
      [bookingId, 1, "Booking created (Pending)"]
    );

    // 🔵 Mark technician unavailable in availability table
    await conn.query(`
      INSERT INTO technicianAvailability (technicianId, timeSlotId, isAvailable)
      VALUES (?, ?, FALSE)
      ON DUPLICATE KEY UPDATE isAvailable = FALSE, updatedAt = CURRENT_TIMESTAMP
    `, [technicianId, timeSlotId]);

    await conn.commit();
    return { bookingId, customerId, technicianId, timeSlotId, notes, statusId: 1 };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

// 🟨 Update booking info
async function updateBookingModel(bookingId, { technicianId, timeSlotId, notes }) {
  const [result] = await pool.query(
    `UPDATE booking SET technicianId = ?, timeSlotId = ?, notes = ? WHERE bookingId = ?`,
    [technicianId || null, timeSlotId, notes || null, bookingId]
  );
  return result;
}

// 🟥 Delete booking
async function deleteBookingModel(bookingId) {
  const [result] = await pool.query(`DELETE FROM booking WHERE bookingId = ?`, [bookingId]);
  return result;
}

// 🟧 Update booking status
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

// 🟦 Booking history
async function getBookingHistoryModel(bookingId) {
  const [rows] = await pool.query(`
    SELECT 
      bh.*, bs.statusName,
      CONCAT(u.firstName, ' ', u.lastName) AS changedByName
    FROM bookingHistory bh
    LEFT JOIN bookingStatus bs ON bh.statusId = bs.id
    LEFT JOIN users u ON bh.changedBy = u.userId
    WHERE bh.bookingId = ?
    ORDER BY bh.changedAt DESC
  `, [bookingId]);
  return rows;
}

// 🟢 Get booked technicians per slot & date
async function getBookedTechniciansBySlotAndDate(timeSlotId, date) {
  const [rows] = await pool.query(`
    SELECT technicianId
    FROM booking
    WHERE timeSlotId = ? AND DATE(createdAt) = ?
  `, [timeSlotId, date]);
  return rows.map(r => r.technicianId);
}

// 🟣 Get all slots + booked techs for a date
async function getSlotsWithBookedTechniciansByDateModel(date) {
  const [slotDateRows] = await pool.query(
    "SELECT * FROM slotDate WHERE slotDate = ?",
    [date]
  );
  const slotDate = slotDateRows[0];
  if (!slotDate) return [];

  const [slots] = await pool.query(`
    SELECT 
      ts.timeSlotId,
      ts.startTime,
      ts.endTime,
      GROUP_CONCAT(b.technicianId) AS bookedTechnicians
    FROM timeSlot ts
    LEFT JOIN booking b
      ON b.timeSlotId = ts.timeSlotId
      AND DATE(b.createdAt) = ?
    WHERE ts.slotDateId = ?
    GROUP BY ts.timeSlotId
    ORDER BY ts.startTime ASC
  `, [date, slotDate.slotDateId]);

  slots.forEach(slot => {
    slot.bookedTechnicians = slot.bookedTechnicians
      ? slot.bookedTechnicians.split(",").map(Number)
      : [];
  });

  return slots;
}

// 🟢 Get all technicians and mark if available for a specific date & slot
async function getTechnicianAvailabilityBySlotModel(date, timeSlotId) {
  const [rows] = await pool.query(`
    SELECT 
      t.technicianId,
      CONCAT(u.firstName, ' ', u.lastName) AS technicianName,
      CASE 
        WHEN ta.isAvailable = FALSE THEN FALSE
        ELSE TRUE
      END AS isAvailable
    FROM technicians t
    JOIN users u ON t.userId = u.userId
    LEFT JOIN technicianAvailability ta
      ON ta.technicianId = t.technicianId
      AND ta.timeSlotId = ?
    LEFT JOIN timeSlot ts ON ta.timeSlotId = ts.timeSlotId
  `, [timeSlotId]);
  return rows;
}

//
// 🟩 Technician Availability Management
//

// 🟢 Initialize technician availability for a new date
async function initializeTechnicianAvailability(date) {
  const [slotDateRows] = await pool.query(
    "SELECT slotDateId FROM slotDate WHERE slotDate = ?",
    [date]
  );
  const slotDate = slotDateRows[0];
  if (!slotDate) throw new Error("Slot date not found");

  const [slots] = await pool.query(
    "SELECT timeSlotId FROM timeSlot WHERE slotDateId = ?",
    [slotDate.slotDateId]
  );

  const [techs] = await pool.query("SELECT technicianId FROM technicians");

  for (const slot of slots) {
    for (const tech of techs) {
      await pool.query(
        `INSERT IGNORE INTO technicianAvailability (technicianId, timeSlotId, isAvailable)
         VALUES (?, ?, TRUE)`,
        [tech.technicianId, slot.timeSlotId]
      );
    }
  }
  return { initialized: true };
}

// 🟣 Get all technician availability for a given date
async function getTechnicianAvailabilityByDateModel(date) {
  const [slotDateRows] = await pool.query(
    "SELECT slotDateId FROM slotDate WHERE slotDate = ?",
    [date]
  );
  const slotDate = slotDateRows[0];
  if (!slotDate) return [];

  const [rows] = await pool.query(`
    SELECT 
      ta.technicianAvailabilityId,
      ta.technicianId,
      CONCAT(u.firstName, ' ', u.lastName) AS technicianName,
      ts.timeSlotId,
      ts.startTime,
      ts.endTime,
      ta.isAvailable
    FROM technicianAvailability ta
    JOIN technicians t ON ta.technicianId = t.technicianId
    JOIN users u ON t.userId = u.userId
    JOIN timeSlot ts ON ta.timeSlotId = ts.timeSlotId
    WHERE ts.slotDateId = ?
    ORDER BY ts.startTime, technicianName
  `, [slotDate.slotDateId]);

  return rows;
}

// 🟡 Update technician availability manually
async function updateTechnicianAvailabilityModel(technicianId, timeSlotId, isAvailable) {
  const [result] = await pool.query(
    `INSERT INTO technicianAvailability (technicianId, timeSlotId, isAvailable)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE isAvailable = VALUES(isAvailable), updatedAt = CURRENT_TIMESTAMP`,
    [technicianId, timeSlotId, isAvailable]
  );
  return result;
}

// 🔵 Automatically mark unavailable when booked
async function markTechnicianUnavailable(technicianId, timeSlotId) {
  await pool.query(
    `UPDATE technicianAvailability 
     SET isAvailable = FALSE 
     WHERE technicianId = ? AND timeSlotId = ?`,
    [technicianId, timeSlotId]
  );
}

// 🟢 Get technician availability by technician and date
async function getTechnicianAvailabilityByTechnicianModel(technicianId, date) {
  try {
    // Find slotDateId for the date
    const [slotDateRows] = await pool.query(
      "SELECT slotDateId FROM slotDate WHERE slotDate = ?",
      [date]
    );

    if (slotDateRows.length === 0) return [];

    const slotDateId = slotDateRows[0].slotDateId;

    const [rows] = await pool.query(
      `
      SELECT 
        ts.timeSlotId,
        ts.startTime,
        ts.endTime,
        COALESCE(ta.isAvailable, TRUE) AS isAvailable
      FROM timeSlot ts
      LEFT JOIN technicianAvailability ta 
        ON ta.timeSlotId = ts.timeSlotId
        AND ta.technicianId = ?
      WHERE ts.slotDateId = ?
      ORDER BY ts.startTime ASC
      `,
      [technicianId, slotDateId]
    );

    return rows;
  } catch (err) {
    console.error("Error in getTechnicianAvailabilityByTechnicianModel:", err);
    throw err;
  }
}


module.exports = {
  getAllBookingsModel,
  getBookingByIdModel,
  createBookingModel,
  updateBookingModel,
  deleteBookingModel,
  updateBookingStatusModel,
  getBookingHistoryModel,
  getBookedTechniciansBySlotAndDate,
  getSlotsWithBookedTechniciansByDateModel,
  getTechnicianAvailabilityBySlotModel,
  initializeTechnicianAvailability,
  getTechnicianAvailabilityByDateModel,
  updateTechnicianAvailabilityModel,
  markTechnicianUnavailable,
  getTechnicianAvailabilityByTechnicianModel,
};

// 🧩 Check if customer already has an active booking
// async function hasActiveBooking(customerId) {
//   const [rows] = await pool.query(
//     `
//     SELECT bookingId FROM booking
//     WHERE customerId = ?
//       AND statusId IN (1, 2, 4)  -- Pending, Confirmed, Rescheduled
//     `,
//     [customerId]
//   );
//   return rows.length > 0;
// }

//  hasActiveBooking, // 🧩 add this line