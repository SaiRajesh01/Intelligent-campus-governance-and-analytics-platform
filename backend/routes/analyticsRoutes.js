const express = require("express");
const router = express.Router();

const {
  analyticsSummary,
  analyticsLeaderboard,
  analyticsTrends
} = require("../controllers/analyticsController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

// All analytics routes restricted to admin and departmentHead
router.get("/summary", protect, authorize("admin", "departmentHead"), analyticsSummary);
router.get("/leaderboard", protect, authorize("admin", "departmentHead"), analyticsLeaderboard);
router.get("/trends", protect, authorize("admin", "departmentHead"), analyticsTrends);

module.exports = router;