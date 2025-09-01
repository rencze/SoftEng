// src/middlewares/roleMiddleware.js
function authorizeRoles(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    if (!allowedRoles.includes(req.user.roleId))
      return res.status(403).json({ error: "Forbidden: insufficient role" });
    next();
  };
}

module.exports = authorizeRoles;
