const mongoose = require("mongoose");

// Helper to check valid Mongo ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Email regex helper
const isValidEmail = (email) => {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
};

// 1. Validate Register
exports.validateRegister = (req, res, next) => {
  const { name, email, password, role, department } = req.body;
  const errors = [];

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    errors.push("Name is required and must be at least 2 characters long.");
  }

  if (!email || !isValidEmail(email)) {
    errors.push("A valid email address is required.");
  }

  if (!password || typeof password !== "string" || password.length < 6) {
    errors.push("Password is required and must be at least 6 characters long.");
  }

  const allowedRoles = ["student", "departmentHead", "admin"];
  if (role && !allowedRoles.includes(role)) {
    errors.push(`Role must be one of: ${allowedRoles.join(", ")}.`);
  }

  if (role === "departmentHead" && (!department || !isValidObjectId(department))) {
    errors.push("A valid department ID is required when registering as a Department Head.");
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: errors[0], errors });
  }

  next();
};

// 2. Validate Login
exports.validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !isValidEmail(email)) {
    errors.push("A valid email address is required.");
  }

  if (!password || typeof password !== "string" || password.length < 1) {
    errors.push("Password is required.");
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: errors[0], errors });
  }

  next();
};

// 3. Validate Create Department
exports.validateCreateDepartment = (req, res, next) => {
  const { name, head } = req.body;
  const errors = [];

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    errors.push("Department name is required and must be at least 2 characters long.");
  }

  if (head && !isValidObjectId(head)) {
    errors.push("Head must be a valid User ObjectId.");
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: errors[0], errors });
  }

  next();
};

// 4. Validate Create Complaint
exports.validateCreateComplaint = (req, res, next) => {
  const { title, description, urgency, department } = req.body;
  const errors = [];

  if (!title || typeof title !== "string" || title.trim().length < 3) {
    errors.push("Title is required and must be at least 3 characters long.");
  }

  if (!description || typeof description !== "string" || description.trim().length < 5) {
    errors.push("Description is required and must be at least 5 characters long.");
  }

  const allowedUrgency = ["low", "medium", "high", "critical"];
  if (urgency && !allowedUrgency.includes(urgency)) {
    errors.push(`Urgency must be one of: ${allowedUrgency.join(", ")}.`);
  }

  if (department && !isValidObjectId(department)) {
    errors.push("Selected department must be a valid Department ObjectId.");
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: errors[0], errors });
  }

  next();
};

// 5. Validate Update Status
exports.validateUpdateStatus = (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;
  const errors = [];

  if (!id || !isValidObjectId(id)) {
    errors.push("Invalid complaint ID parameter.");
  }

  const allowedStatuses = ["open", "in-progress", "escalated", "resolved", "closed"];
  if (!status || !allowedStatuses.includes(status)) {
    errors.push(`Status is required and must be one of: ${allowedStatuses.join(", ")}.`);
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: errors[0], errors });
  }

  next();
};

// 6. Validate Add Feedback
exports.validateAddFeedback = (req, res, next) => {
  const { id } = req.params;
  const { rating, comment } = req.body;
  const errors = [];

  if (!id || !isValidObjectId(id)) {
    errors.push("Invalid complaint ID parameter.");
  }

  const numRating = Number(rating);
  if (!rating || isNaN(numRating) || numRating < 1 || numRating > 5) {
    errors.push("Rating is required and must be a number between 1 and 5.");
  }

  if (comment && (typeof comment !== "string" || comment.length > 1000)) {
    errors.push("Comment must be a string under 1000 characters.");
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: errors[0], errors });
  }

  next();
};

// 7. Validate Mongo ID Param
exports.validateMongoIdParam = (req, res, next) => {
  const { id } = req.params;
  if (!id || !isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid ID parameter format." });
  }
  next();
};
