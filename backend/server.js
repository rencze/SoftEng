// server.js
require("dotenv").config();
const app = require("./app");
const pool = require("./src/config/db");

const PORT = process.env.PORT || 3001;

// Test DB connection before starting server
(async () => {
  try {
    await pool.getConnection();
    console.log("✅ MySQL Connected!");
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
        process.exit(1);
  }
})();

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  
});
