// src/features/users/users.controller.js

// Get the profile of the logged-in user
function getProfile(req, res) {
  res.json({ message: "This is your profile", user: req.user });
}

// Accessible only by Owner (roleId = 2)
function adminOnly(req, res) {
  res.json({ message: "Welcome, Owner!" });
}

module.exports = { getProfile, adminOnly };
