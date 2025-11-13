const express = require("express");
const cors = require("cors");
const authRoutes = require("./src/features/auth/auth.routes");
const userRoutes = require("./src/features/users/users.routes");
const technicianRoutes = require("./src/features/technicians/technicians.routes");
const customerRoutes = require("./src/features/customers/customers.routes");
const servicesRoutes = require("./src/features/services/services.routes");
const servicePackagesRoutes = require("./src/features/servicePackages/servicePackages.routes");
const partsRoutes = require("./src/features/parts/parts.routes");
const vehicleRoutes = require("./src/features/vehicle/vehicle.routes");
const registeredVehicleRoutes = require("./src/features/registeredVehicle/registeredVehicle.routes");
const slotDatesRoutes = require("./src/features/slotDates/slotDates.routes");
const serviceRequestBookingRoutes = require("./src/features/serviceRequestBooking/serviceRequestBooking.routes")
const bookingRoutes = require("./src/features/booking/booking.routes");
const quotationRoutes = require("./src/features/quotation/quotation.routes");

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || "*",
  credentials: true,
}));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/technicians", technicianRoutes);
app.use("/api/customers", customerRoutes); 
app.use("/api/services", servicesRoutes);
app.use("/api/service-packages", servicePackagesRoutes);
app.use("/api/parts", partsRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/registered-vehicle", registeredVehicleRoutes);
app.use("/api/slot-dates", slotDatesRoutes);
app.use("/api/service-request-bookings", serviceRequestBookingRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/quotations", quotationRoutes);

module.exports = app;
