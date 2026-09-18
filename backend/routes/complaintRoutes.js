const express = require("express");
const router = express.Router();

const {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateStatus,
  deleteComplaint,
  addFeedback
} = require("../controllers/complaintController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const {
  validateCreateComplaint,
  validateUpdateStatus,
  validateAddFeedback,
  validateMongoIdParam
} = require("../middleware/validationMiddleware");

// Any authenticated user can create a complaint
router.post("/", protect, validateCreateComplaint, createComplaint);

// Any authenticated user can list complaints (role-based filtering in controller)
router.get("/", protect, getComplaints);

// Any authenticated user can view a single complaint (role-based access in controller)
router.get("/:id", protect, validateMongoIdParam, getComplaintById);

// Only admin and departmentHead can update complaint status
router.put("/:id/status", protect, authorize("admin", "departmentHead"), validateUpdateStatus, updateStatus);

// Only admin can delete a complaint
router.delete("/:id", protect, authorize("admin"), validateMongoIdParam, deleteComplaint);

// Student submits feedback on a resolved complaint
router.post("/:id/feedback", protect, validateAddFeedback, addFeedback);

module.exports = router;
