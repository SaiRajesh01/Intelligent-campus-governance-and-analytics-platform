const express = require("express");
const router = express.Router();

const {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} = require("../controllers/notificationController");

const { protect } = require("../middleware/authMiddleware");
const { validateMongoIdParam } = require("../middleware/validationMiddleware");

// All notification routes require authentication
router.get("/", protect, getMyNotifications);
router.put("/read-all", protect, markAllAsRead);      // must come before /:id
router.put("/:id/read", protect, validateMongoIdParam, markAsRead);
router.delete("/:id", protect, validateMongoIdParam, deleteNotification);

module.exports = router;
