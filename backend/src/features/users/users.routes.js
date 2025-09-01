//src/featues/auth/users/users.routes.js

const express = require("express");
const router = express.Router();
const authenticateToken = require("../../middlewares/authMiddleware");
const authorizeRoles = require("../../middlewares/roleMiddleware");

// Accessible by any logged-in user
router.get("/profile", authenticateToken, (req, res) => {
  res.json({ message: "This is your profile", user: req.user });
});

// Accessible only by Owner (roleId = 2)
router.get("/admin", authenticateToken, authorizeRoles([2]), (req, res) => {
  res.json({ message: "Welcome, Owner!" });
});

module.exports = router;
