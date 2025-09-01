//src/features/auth/auth.routes
const express = require("express");
const router = express.Router();
const { register, login, forgotPassword, resetPassword } = require("./auth.controller");

// Routes
router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword); 
router.post("/reset-password", resetPassword);

module.exports = router;
