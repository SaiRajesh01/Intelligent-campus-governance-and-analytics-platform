// authMiddleware.js - JWT authentication with full user hydration
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token = req.headers.authorization;

  if (token && token.startsWith("Bearer")) {
    try {
      token = token.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch the full user from DB so req.user.department is always
      // available for role-based scoping in controllers.
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return res.status(401).json({ message: "User no longer exists" });
      }

      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({ message: "Not authorized" });
    }
  } else {
    res.status(401).json({ message: "No token" });
  }
};

module.exports = { protect };