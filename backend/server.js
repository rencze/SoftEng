// server.js
require("dotenv").config();
const app = require("./app");
const pool = require("./src/config/db");
const { generateRollingSlots } = require("./src/features/slotDates/slotGenerator");
const cron = require("node-cron");

const PORT = process.env.PORT || 3001;

// Test DB connection before starting server
(async () => {
  try {
    await pool.getConnection();
    console.log("✅ MySQL Connected!");

    // Generate/Update slots on server start
    await generateRollingSlots();

    // Schedule daily slot update at midnight
    cron.schedule("0 0 * * *", async () => {
      console.log("🔄 Daily slot update running...");
      await generateRollingSlots();
    });

  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
        // process.exit(1);
  }
})();

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  
});
