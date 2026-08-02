const Complaint = require("../models/Complaint");
const Department = require("../models/Department");

// ===========================================================================
// Analytics Service
// ===========================================================================
// All heavy aggregation logic lives here. The controller is a thin wrapper
// that calls these functions and returns the JSON.
// ===========================================================================

// ---------------------------------------------------------------------------
// 1. getSummary
// ---------------------------------------------------------------------------
// Returns: total, open, in-progress, resolved, escalated, closed counts,
//          average resolution time (ms & human-readable),
//          complaints by category, complaints by department.
// ---------------------------------------------------------------------------
exports.getSummary = async () => {
  // ── Status counts (single aggregation) ──────────────────────────────────
  const statusAgg = await Complaint.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 }
      }
    }
  ]);

  const statusMap = {};
  let total = 0;
  for (const s of statusAgg) {
    statusMap[s._id] = s.count;
    total += s.count;
  }

  // ── Average resolution time ─────────────────────────────────────────────
  // Only considers complaints that have both createdAt and resolvedAt.
  const resolutionAgg = await Complaint.aggregate([
    { $match: { resolvedAt: { $exists: true, $ne: null } } },
    {
      $project: {
        resolutionMs: { $subtract: ["$resolvedAt", "$createdAt"] }
      }
    },
    {
      $group: {
        _id: null,
        avgResolutionMs: { $avg: "$resolutionMs" },
        count: { $sum: 1 }
      }
    }
  ]);

  const avgResolutionMs = resolutionAgg[0]?.avgResolutionMs || 0;
  const resolvedCount = resolutionAgg[0]?.count || 0;

  // ── By category ─────────────────────────────────────────────────────────
  const byCategory = await Complaint.aggregate([
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } }
  ]);

  // ── By department ───────────────────────────────────────────────────────
  const byDepartment = await Complaint.aggregate([
    {
      $group: {
        _id: "$department",
        count: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: "departments",
        localField: "_id",
        foreignField: "_id",
        as: "dept"
      }
    },
    { $unwind: { path: "$dept", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 1,
        departmentName: { $ifNull: ["$dept.name", "Unassigned"] },
        count: 1
      }
    },
    { $sort: { count: -1 } }
  ]);

  return {
    total,
    open: statusMap["open"] || 0,
    "in-progress": statusMap["in-progress"] || 0,
    escalated: statusMap["escalated"] || 0,
    resolved: statusMap["resolved"] || 0,
    closed: statusMap["closed"] || 0,
    averageResolutionTime: {
      ms: Math.round(avgResolutionMs),
      hours: +(avgResolutionMs / (1000 * 60 * 60)).toFixed(2),
      resolvedCount
    },
    byCategory: byCategory.map((c) => ({
      category: c._id || "Uncategorized",
      count: c.count
    })),
    byDepartment
  };
};

// ---------------------------------------------------------------------------
// 2. getLeaderboard
// ---------------------------------------------------------------------------
// Ranks departments by a composite gamification score:
//   score = (resolutionRate × 40) + (slaCompliance × 40) + (speedScore × 20)
//
// - resolutionRate   = resolvedCount / totalComplaints
// - slaCompliance    = complaintsResolvedBeforeSLA / totalResolved
// - speedScore       = normalized inverse avg resolution time (faster = higher)
// ---------------------------------------------------------------------------
exports.getLeaderboard = async () => {
  // Aggregate per-department stats from the complaints collection
  const deptStats = await Complaint.aggregate([
    {
      $group: {
        _id: "$department",
        totalComplaints: { $sum: 1 },
        resolvedCount: {
          $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] }
        },
        closedCount: {
          $sum: { $cond: [{ $eq: ["$status", "closed"] }, 1, 0] }
        },
        // SLA compliance: resolved AND resolvedAt <= slaDeadline
        slaCompliant: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $in: ["$status", ["resolved", "closed"]] },
                  { $ne: ["$resolvedAt", null] },
                  { $ne: ["$slaDeadline", null] },
                  { $lte: ["$resolvedAt", "$slaDeadline"] }
                ]
              },
              1,
              0
            ]
          }
        },
        // Average resolution time (ms) for resolved complaints
        avgResolutionMs: {
          $avg: {
            $cond: [
              { $ne: ["$resolvedAt", null] },
              { $subtract: ["$resolvedAt", "$createdAt"] },
              null
            ]
          }
        }
      }
    },
    {
      $lookup: {
        from: "departments",
        localField: "_id",
        foreignField: "_id",
        as: "dept"
      }
    },
    { $unwind: { path: "$dept", preserveNullAndEmptyArrays: true } }
  ]);

  if (deptStats.length === 0) return [];

  // ── Compute raw rates ───────────────────────────────────────────────────
  const entries = deptStats.map((d) => {
    const totalResolved = d.resolvedCount + d.closedCount;
    const resolutionRate =
      d.totalComplaints > 0 ? totalResolved / d.totalComplaints : 0;
    const slaCompliance =
      totalResolved > 0 ? d.slaCompliant / totalResolved : 0;
    const avgHours = d.avgResolutionMs
      ? d.avgResolutionMs / (1000 * 60 * 60)
      : null;

    return {
      departmentId: d._id,
      departmentName: d.dept?.name || "Unassigned",
      totalComplaints: d.totalComplaints,
      resolvedCount: totalResolved,
      resolutionRate: +resolutionRate.toFixed(4),
      slaCompliance: +slaCompliance.toFixed(4),
      avgResolutionHours: avgHours !== null ? +avgHours.toFixed(2) : null
    };
  });

  // ── Normalize speed score (0–1, fastest = 1) ───────────────────────────
  const resolvedEntries = entries.filter((e) => e.avgResolutionHours !== null);
  const maxHours =
    resolvedEntries.length > 0
      ? Math.max(...resolvedEntries.map((e) => e.avgResolutionHours))
      : 1;

  for (const e of entries) {
    if (e.avgResolutionHours !== null && maxHours > 0) {
      e.speedScore = +(1 - e.avgResolutionHours / maxHours).toFixed(4);
    } else {
      e.speedScore = 0;
    }
  }

  // ── Composite gamification score ────────────────────────────────────────
  // Weights: resolution rate 40%, SLA compliance 40%, speed 20%
  const WEIGHT_RESOLUTION = 40;
  const WEIGHT_SLA = 40;
  const WEIGHT_SPEED = 20;

  for (const e of entries) {
    e.gamificationScore = +(
      e.resolutionRate * WEIGHT_RESOLUTION +
      e.slaCompliance * WEIGHT_SLA +
      e.speedScore * WEIGHT_SPEED
    ).toFixed(2);
  }

  // Sort descending by gamification score
  entries.sort((a, b) => b.gamificationScore - a.gamificationScore);

  // Add rank
  entries.forEach((e, i) => {
    e.rank = i + 1;
  });

  return entries;
};

// ---------------------------------------------------------------------------
// 3. getTrends
// ---------------------------------------------------------------------------
// Groups complaints by time period (week or month) and category.
// Also computes a naive "predicted next period volume" using a simple
// moving average over the last N periods.
//
// Query params:
//   ?period=week|month  (default: month)
//   ?window=3           (moving-average window size, default: 3)
//
// ─── LIMITATION ──────────────────────────────────────────────────────────
// The prediction is a simple moving average (SMA) — it assumes the trend
// is roughly linear/stable and doesn't account for seasonality, weekday
// effects, or external events. For production-grade forecasting, replace
// this with a proper time-series model (e.g. ARIMA, Prophet, or an ML
// microservice). The SMA approach is intentionally kept here to avoid
// external dependencies while still providing a directionally useful
// estimate.
// ─────────────────────────────────────────────────────────────────────────
exports.getTrends = async (period = "month", window = 3) => {
  // ── Date grouping expression ────────────────────────────────────────────
  let dateGroup;
  if (period === "week") {
    dateGroup = {
      year: { $isoWeekYear: "$createdAt" },
      week: { $isoWeek: "$createdAt" }
    };
  } else {
    // month (default)
    dateGroup = {
      year: { $year: "$createdAt" },
      month: { $month: "$createdAt" }
    };
  }

  // ── Aggregate: complaints per period ────────────────────────────────────
  const volumeByPeriod = await Complaint.aggregate([
    {
      $group: {
        _id: dateGroup,
        count: { $sum: 1 }
      }
    },
    { $sort: { "_id.year": 1, "_id.month": 1, "_id.week": 1 } }
  ]);

  // ── Aggregate: complaints per period × category ─────────────────────────
  const volumeByPeriodAndCategory = await Complaint.aggregate([
    {
      $group: {
        _id: {
          period: dateGroup,
          category: "$category"
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: {
        "_id.period.year": 1,
        "_id.period.month": 1,
        "_id.period.week": 1,
        "_id.category": 1
      }
    }
  ]);

  // ── Shape the per-period-category data into a friendlier structure ──────
  const categoryBreakdown = volumeByPeriodAndCategory.map((item) => ({
    period: item._id.period,
    category: item._id.category || "Uncategorized",
    count: item.count
  }));

  // ── Moving-average prediction ───────────────────────────────────────────
  // Take the last `window` periods' volumes and average them.
  const volumes = volumeByPeriod.map((v) => v.count);
  const effectiveWindow = Math.min(window, volumes.length);
  let predictedNextPeriod = null;

  if (effectiveWindow > 0) {
    const recentSlice = volumes.slice(-effectiveWindow);
    const sum = recentSlice.reduce((a, b) => a + b, 0);
    predictedNextPeriod = +(sum / effectiveWindow).toFixed(2);
  }

  // ── Per-category predictions ────────────────────────────────────────────
  // Group category breakdown by category, then SMA each category's series.
  const catSeriesMap = {};
  for (const item of categoryBreakdown) {
    if (!catSeriesMap[item.category]) catSeriesMap[item.category] = [];
    catSeriesMap[item.category].push(item.count);
  }

  const categoryPredictions = {};
  for (const [cat, series] of Object.entries(catSeriesMap)) {
    const w = Math.min(window, series.length);
    if (w > 0) {
      const slice = series.slice(-w);
      categoryPredictions[cat] = +(
        slice.reduce((a, b) => a + b, 0) / w
      ).toFixed(2);
    }
  }

  return {
    period,
    movingAverageWindow: effectiveWindow,
    timeline: volumeByPeriod.map((v) => ({
      period: v._id,
      count: v.count
    })),
    categoryBreakdown,
    prediction: {
      method: "Simple Moving Average (SMA)",
      window: effectiveWindow,
      predictedNextPeriodTotal: predictedNextPeriod,
      predictedByCategory: categoryPredictions,
      // ── Limitation note (also exposed in API for transparency) ──────
      note:
        "This prediction uses a simple moving average and does not account " +
        "for seasonality, trend acceleration, or external factors. For " +
        "production use, consider ARIMA, Holt-Winters, or an ML service."
    }
  };
};