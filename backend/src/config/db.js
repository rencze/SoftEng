//src/config/db.js

const mysql = require("mysql2/promise");

//Create a connection pool (recommneded for production apps)
const pool = mysql.createPool({
host: process.env.DB_HOST || "localhost",
user: process.env.DB_USER || "root",
password : process.env.DB_PASSWORD || "root",
database: process.env.DB_NAME || "soft_eng",
port: process.env.DB_PORT || 3306,
waitForConnections: true,
connectionLimit: 10,
queueLimit: 0
});

// Test connection
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Database connected successfully!");
    connection.release();
  } catch (err) {
    console.error("❌ Database connection failed:", err);
    process.exit(1);
  }
})();

module.exports = pool;