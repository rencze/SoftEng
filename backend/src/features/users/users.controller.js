// src/features/users/users.controller.js
const { getAllUsers, updateUser, deleteUser } = require("./users.model");

// Get the profile of the logged-in user
function getProfile(req, res) {
  res.json({ message: "This is your profile", user: req.user });
}

// Accessible only by Owner (roleId = 2)
function adminOnly(req, res) {
  res.json({ message: "Welcome, Owner!" });
}

// Get all users
async function getUsers(req, res) {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Update
async function editUser(req, res) {
  try {
    const { id } = req.params;
    const result = await updateUser(id, req.body);
    res.json({ message: "User updated", result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Delete
async function removeUser(req, res) {
  try {
    const { id } = req.params;
    const result = await deleteUser(id);
    res.json({ message: "User deleted", result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getProfile, adminOnly, getUsers, editUser, removeUser };
