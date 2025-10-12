const pool = require("../../config/db");
const SlotModel = require("./slotDates.model");

//
// --- INDIVIDUAL SLOT GENERATION (with duplicate protection) ---
//
async function generateTimeSlots(slotDateId, startTime, endTime, interval) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // ✅ Check if slots already exist for this slotDateId
    const [existing] = await conn.query(
      "SELECT COUNT(*) as count FROM timeSlot WHERE slotDateId = ?",
      [slotDateId]
    );

    if (existing[0].count > 0) {
      console.log(`⚠️ Slots already exist for slotDateId ${slotDateId}, skipping generation.`);
      await conn.rollback();
      return { message: "Slots already exist, skipping generation" };
    }

    // ✅ Generate slots if none exist
    const timeSlots = [];
    let currentTime = new Date(startTime);

    while (currentTime < new Date(endTime)) {
      const nextTime = new Date(currentTime.getTime() + interval * 60000);
      if (nextTime > new Date(endTime)) break;

      timeSlots.push([
        slotDateId,
        currentTime.toTimeString().slice(0, 5),
        nextTime.toTimeString().slice(0, 5),
        true
      ]);

      currentTime = nextTime;
    }

    // ✅ Insert into DB
    await conn.query(
      "INSERT INTO timeSlot (slotDateId, startTime, endTime, isAvailable) VALUES ?",
      [timeSlots]
    );

    await conn.commit();
    console.log(`✅ Slots generated for slotDateId ${slotDateId}`);
    return { message: "Slots generated successfully" };
  } catch (error) {
    await conn.rollback();
    console.error("❌ Slot generation error:", error);
    throw error;
  } finally {
    conn.release();
  }
}

//
// --- ROLLING 60-DAY SLOT DATE GENERATION ---
//
const DAYS_AHEAD = 60;

async function generateRollingSlots() {
  try {
    let lastSlot = await SlotModel.getLastSlotDateModel();
    let startDate = lastSlot ? new Date(lastSlot.slotDate) : new Date();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let daysToGenerate = DAYS_AHEAD;

    if (lastSlot) {
      const lastSlotDate = new Date(lastSlot.slotDate);
      const diffTime = lastSlotDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      daysToGenerate = DAYS_AHEAD - diffDays;
    }

    if (daysToGenerate <= 0) {
      console.log("✅ Slots already cover the next 60 days.");
      return;
    }

    for (let i = 1; i <= daysToGenerate; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const day = date.getDay(); // 0 = Sunday
      const formattedDate = date.toISOString().split("T")[0];

      // ✅ Skip if slotDate already exists
      const exists = await SlotModel.getSlotDateByDateModel(formattedDate);
      if (exists) continue;

      const isOpen = day !== 0;
      const slotDate = await SlotModel.createSlotDateModel({ slotDate: formattedDate, isOpen });

      let startHour = 8;
      let endHour = day === 6 ? 16 : 18; // Sat: 8-4, Mon-Fri: 8-6

      for (let hour = startHour; hour < endHour; hour++) {
        const startTime = `${hour.toString().padStart(2, "0")}:00:00`;
        const endTime = `${(hour + 1).toString().padStart(2, "0")}:00:00`;

        await SlotModel.createTimeSlotModel({
          slotDateId: slotDate.slotDateId,
          startTime,
          endTime,
        });
      }
    }

    console.log(`✅ Rolling slots updated to cover next ${DAYS_AHEAD} days.`);
  } catch (err) {
    console.error("❌ Rolling slot generation error:", err);
  }
}

//
// --- EXPORT BOTH FUNCTIONS ---
//
module.exports = {
  generateTimeSlots,
  generateRollingSlots,
};
