const {
  getSummary,
  getLeaderboard,
  getTrends
} = require("../services/analyticsService");

// ---------------------------------------------------------------------------
// 1. GET /api/analytics/summary
// ---------------------------------------------------------------------------
// Total complaints, status breakdown, average resolution time,
// complaints by category and by department.
// ---------------------------------------------------------------------------
exports.analyticsSummary = async (req, res) => {
  try {
    const data = await getSummary();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------------------------------------------------------------------------
// 2. GET /api/analytics/leaderboard
// ---------------------------------------------------------------------------
// Ranks departments by a weighted composite gamification score:
//   resolution rate (40%) + SLA compliance (40%) + speed (20%)
// ---------------------------------------------------------------------------
exports.analyticsLeaderboard = async (req, res) => {
  try {
    const data = await getLeaderboard();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------------------------------------------------------------------------
// 3. GET /api/analytics/trends?period=month&window=3
// ---------------------------------------------------------------------------
// Complaint volume grouped by week/month and category, plus a naive
// moving-average prediction for the next period.
// ---------------------------------------------------------------------------
exports.analyticsTrends = async (req, res) => {
  try {
    const period = req.query.period === "week" ? "week" : "month";
    const window = Math.max(parseInt(req.query.window, 10) || 3, 1);

    const data = await getTrends(period, window);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};