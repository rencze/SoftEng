  // slotDates.model.js
  const pool = require("../../config/db"); // adjust path to your db config

  // --- SlotDate Queries ---



  // --- Update SlotDate and cascade to TimeSlots ---
  async function updateSlotDateAndCascade(slotDateId, { slotDate, isOpen }) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // 1. Update the slotDate
      await conn.query(
        "UPDATE slotDate SET slotDate = COALESCE(?, slotDate), isOpen = ? WHERE slotDateId = ?",
        [slotDate, isOpen, slotDateId]
      );

      // 2. Update all related timeSlots availability
      await conn.query(
        "UPDATE timeSlot SET isAvailable = ? WHERE slotDateId = ?",
        [isOpen, slotDateId]
      );

      await conn.commit();
      return { slotDateId, slotDate, isOpen };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }



  async function getAllSlotDatesModel() {
    const [rows] = await pool.query("SELECT * FROM slotDate ORDER BY slotDate ASC");
    return rows;
  }

  async function getSlotDateByIdModel(slotDateId) {
    const [rows] = await pool.query("SELECT * FROM slotDate WHERE slotDateId = ?", [slotDateId]);
    return rows[0];
  }

  async function getSlotDateByDateModel(date) {
    const [rows] = await pool.query("SELECT * FROM slotDate WHERE slotDate = ?", [date]);
    return rows[0];
  }

  async function createSlotDateModel({ slotDate, isOpen }) {
    const [result] = await pool.query(
      "INSERT INTO slotDate (slotDate, isOpen) VALUES (?, ?)",
      [slotDate, isOpen ?? true]
    );
    return { slotDateId: result.insertId, slotDate, isOpen };
  }

  async function updateSlotDateModel(slotDateId, { slotDate, isOpen }) {
    const [result] = await pool.query(
      "UPDATE slotDate SET slotDate = ?, isOpen = ? WHERE slotDateId = ?",
      [slotDate, isOpen, slotDateId]
    );
    return result;
  }

  async function deleteSlotDateModel(slotDateId) {
    const [result] = await pool.query(
      "DELETE FROM slotDate WHERE slotDateId = ?",
      [slotDateId]
    );
    return result;
  }

  async function getLastSlotDateModel() {
    const [rows] = await pool.query(
      "SELECT * FROM slotDate ORDER BY slotDate DESC LIMIT 1"
    );
    return rows[0];
  }

  // --- TimeSlot Queries ---
  async function getTimeSlotsBySlotDateIdModel(slotDateId) {
    const [rows] = await pool.query(
      "SELECT * FROM timeSlot WHERE slotDateId = ? ORDER BY startTime ASC",
      [slotDateId]
    );
    return rows;
  }

  async function createTimeSlotModel({ slotDateId, startTime, endTime, isAvailable }) {
    const [result] = await pool.query(
      "INSERT INTO timeSlot (slotDateId, startTime, endTime, isAvailable) VALUES (?, ?, ?, ?)",
      [slotDateId, startTime, endTime, isAvailable ?? true]
    );
    return { timeSlotId: result.insertId, slotDateId, startTime, endTime, isAvailable };
  }

  async function updateTimeSlotModel(timeSlotId, startTime, endTime, isAvailable) {
    const [result] = await pool.query(
      "UPDATE timeSlot SET startTime = ?, endTime = ?, isAvailable = ? WHERE timeSlotId = ?",
      [startTime, endTime, isAvailable, timeSlotId]
    );
    return result;
  }

  async function updateTimeSlotAvailabilityModel(timeSlotId, isAvailable) {
    const [result] = await pool.query(
      "UPDATE timeSlot SET isAvailable = ? WHERE timeSlotId = ?",
      [isAvailable, timeSlotId]
    );
    return result;
  }

  async function deleteTimeSlotModel(timeSlotId) {
    const [result] = await pool.query(
      "DELETE FROM timeSlot WHERE timeSlotId = ?",
      [timeSlotId]
    );
    return result;
  }

  module.exports = {
    updateSlotDateAndCascade,
    getAllSlotDatesModel,
    getSlotDateByIdModel,
    getSlotDateByDateModel,
    createSlotDateModel,
    updateSlotDateModel,
    deleteSlotDateModel,
    getLastSlotDateModel,
    getTimeSlotsBySlotDateIdModel,
    createTimeSlotModel,
    updateTimeSlotModel,
    updateTimeSlotAvailabilityModel,
    deleteTimeSlotModel,
  };
