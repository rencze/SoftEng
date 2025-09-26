const express = require("express");
const cors = require("cors");
const authRoutes = require("./src/features/auth/auth.routes");
const userRoutes = require("./src/features/users/users.routes");
const technicianRoutes = require("./src/features/technicians/technicians.routes");
const servicesRoutes = require("./src/features/services/services.routes");
const servicePackagesRoutes = require("./src/features/servicePackages/servicePackages.routes");
const partsRoutes = require("./src/features/parts/parts.routes");
const vehicleRoutes = require("./src/features/vehicle/vehicle.routes");

const app = express();

// ✅ Use env CLIENT_URL if available, fallback to * in dev
app.use(cors({
  origin: process.env.CLIENT_URL || "*",
  credentials: true,
}));

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/technicians", technicianRoutes);
app.use("/api/services", servicesRoutes);
app.use("/api/service-packages", servicePackagesRoutes);
app.use("/api/parts", partsRoutes);
app.use("/api/vehicles", vehicleRoutes);


// app.get("/test", (req, res) => {
//   res.send("Server is reachable!");
// });

module.exports = app;

// Validation – add request validation (e.g. express-validator or Joi) so invalid inputs don’t reach the DB.
// Transactions – for updates that touch multiple tables (like user + technician), wrapping in a transaction ensures consistency if one query fails.
// Logging – you’re console logging errors in some places, but adding a logger (like winston or pino) will help in production.
// Soft deletes – instead of fully deleting users, you might consider a deletedAt flag if you want history.