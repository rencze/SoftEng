const express = require("express");
const cors = require("cors");
const authRoutes = require("./src/features/auth/auth.routes");
const userRoutes = require("./src/features/users/users.routes");

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

app.get("/test", (req, res) => {
  res.send("Server is reachable!");
});

module.exports = app;
