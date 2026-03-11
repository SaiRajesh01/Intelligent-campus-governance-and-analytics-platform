// authMiddleware.js - starter file
// const jwt = require("jsonwebtoken");

// const protect = (req, res, next) => {
//   let token = req.headers.authorization;

//   if (token && token.startsWith("Bearer")) {
//     try {
//       token = token.split(" ")[1];

//       const decoded = jwt.verify(token, process.env.JWT_SECRET);

//       req.user = decoded;

//       next();
//     } catch (error) {
//       res.status(401).json({ message: "Not authorized" });
//     }
//   } else {
//     res.status(401).json({ message: "No token" });
//   }
// };

// module.exports = { protect };