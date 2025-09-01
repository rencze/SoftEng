// src/features/auth/auth.controller.js
const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET || "supersecretkey";
const { findUserByUsername, findUserByEmail, createUser, updatePasswordByEmail } = require("./auth.model");

//  1. REGISTER
async function register(req, res) {
  console.log("✅ Register endpoint hit"); // check if route is called
  console.log("Request body:", req.body); // check what body is received
  try {
    const { username, email, password } = req.body;

    if (await findUserByUsername(username))
      return res.status(400).json({ error: "Username already exists" });

    if (await findUserByEmail(email))
      return res.status(400).json({ error: "Email already exists" });

    const result = await createUser({ username, email, password });
    console.log("User created:", result); // confirm DB insert
    res.status(201).json({ message: "User registered successfully", userId: result.insertId });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: err.message });
  }
}

//  2. LOGIN
async function login(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ message: "Username and password required" });

    const user = await findUserByUsername(username);
    if (!user || user.password !== password)
      return res.status(401).json({ message: "Invalid username or password" });

    const token = jwt.sign(
      { userId: user.userId || user.id, roleId: user.roleId, username: user.username },
      SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: { userId: user.userId || user.id, username: user.username, email: user.email, roleId: user.roleId },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

//  3. FORGOT PASSWORD (request)
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await findUserByEmail(email);
    if (!user) return res.status(404).json({ message: "User not found" });

    // In real apps → send email with reset link or OTP
    res.json({ message: "Reset request received. Proceed to set new password." });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// 4. RESET PASSWORD
async function resetPassword(req, res) {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword)
      return res.status(400).json({ message: "Email and new password required" });

    const updated = await updatePasswordByEmail(email, newPassword);
    if (!updated) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = { register, login, forgotPassword, resetPassword};

