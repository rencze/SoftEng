// src/features/users/users.controller.js
const { getAllUsers, updateUser, deleteUser, updateUserBlockStatus,findUserById } = require("./users.model");

async function getProfile(req, res) {
  try {
    const user = await findUserById(req.user.userId, true); // include roleName
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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

    // Add message based on role
    const message = req.body.roleId === 1
      ? "User updated and added as Technician"
      : "User updated and removed from Technician if existed";

    res.json({ message, result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}



// // Update
// async function editUser(req, res) {
//   try {
//     const { id } = req.params;
//     const result = await updateUser(id, req.body);
//     res.json({ message: "User updated", result });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// }

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

// Block/unblock
async function toggleBlockUser(req, res) {
  try {
    const { id } = req.params;
    const { isBlocked } = req.body;

    const result = await updateUserBlockStatus(id, isBlocked);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: isBlocked ? "User blocked successfully" : "User unblocked successfully",
    });
  } catch (err) {
    console.error("Block/unblock error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = { getProfile, adminOnly, getUsers, editUser, removeUser, toggleBlockUser };
