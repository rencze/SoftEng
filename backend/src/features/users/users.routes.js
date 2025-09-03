// src/features/users/users.routes.js
const express = require("express");
const router = express.Router();

const {
  getUsers,
  editUser,
  removeUser,
  getProfile,
  adminOnly,
} = require("./users.controller");

const authenticateToken = require("../../middlewares/authMiddleware");
const authorizeRoles = require("../../middlewares/roleMiddleware");

// Profile route
router.get("/profile", authenticateToken, getProfile);

// Accessible only by Owner (roleId = 2)
router.get("/admin", authenticateToken, authorizeRoles([2]), adminOnly);

// CRUD Users
router.get("/", getUsers);       // GET all users
router.put("/:id", editUser);    // UPDATE user
router.delete("/:id", removeUser); // DELETE user

module.exports = router;
