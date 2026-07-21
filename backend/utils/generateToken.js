// generateToken.js - starter file
const jwt = require("jsonwebtoken");

module.exports = function (id, role) {
  return jwt.sign({ id, role },
    process.env.JWT_SECRET, {
    expiresIn: "7d"
  });
};