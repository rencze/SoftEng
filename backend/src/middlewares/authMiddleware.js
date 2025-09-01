// src/middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  // Get token from header
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

  if (!token) return res.status(401).json({ error: "Access denied. No token provided." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "supersecretkey");
    req.user = decoded; // { userId, roleId, iat, exp }
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired token." });
  }
}

module.exports = authenticateToken;
