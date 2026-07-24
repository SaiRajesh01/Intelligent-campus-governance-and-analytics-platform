const Complaint = require("../models/Complaint");
const Department = require("../models/Department");
const Notification = require("../models/Notification");
const User = require("../models/User");

// ---------------------------------------------------------------------------
// Escalation Service
// ---------------------------------------------------------------------------
// Checks all open / in-progress complaints whose SLA deadline has passed,
// increments their escalation level, and reassigns to the next authority:
//
//   Level 0 → 1  :  departmentHead  (notify department head)
//   Level 1 → 2+ :  admin           (notify all admins)
//
// A Notification document is created for each new assignee so the
// notification routes / socket layer can pick them up.
// ---------------------------------------------------------------------------

/**
 * Run one escalation sweep.
 * Designed to be called on a cron schedule (e.g. every 15 minutes).
 */
async function runEscalationCheck() {
  const now = new Date();

  try {
    // Find complaints that are still active and overdue
    const overdueComplaints = await Complaint.find({
      status: { $in: ["open", "in-progress"] },
      slaDeadline: { $lte: now }
    }).populate("department");

    if (overdueComplaints.length === 0) return;

    console.log(
      `[Escalation] ${now.toISOString()} — Found ${overdueComplaints.length} overdue complaint(s)`
    );

    for (const complaint of overdueComplaints) {
      const previousLevel = complaint.escalationLevel || 0;
      const newLevel = previousLevel + 1;
      const previousStatus = complaint.status;

      // Update complaint
      complaint.escalationLevel = newLevel;
      complaint.status = "escalated";

      // Log the status change
      if (!complaint.statusHistory) {
        complaint.statusHistory = [];
      }
      complaint.statusHistory.push({
        from: previousStatus,
        to: "escalated",
        changedBy: null, // system-initiated
        changedAt: now
      });

      await complaint.save();

      // ── Determine who to notify ───────────────────────────────────────
      if (newLevel === 1) {
        // Escalate to department head
        await notifyDepartmentHead(complaint);
      } else {
        // Level 2+: escalate to admin(s)
        await notifyAdmins(complaint);
      }
    }

    console.log(
      `[Escalation] ${now.toISOString()} — Escalation sweep complete`
    );
  } catch (error) {
    console.error("[Escalation] Error during escalation check:", error.message);
  }
}

// ---------------------------------------------------------------------------
// Notification helpers
// ---------------------------------------------------------------------------

/**
 * Notify the department head about an escalated complaint.
 */
async function notifyDepartmentHead(complaint) {
  const department = complaint.department;

  if (!department || !department.head) {
    // No department head assigned — fall through to admin notification
    console.warn(
      `[Escalation] No department head for department ${department?.name || "unknown"}, notifying admins instead`
    );
    return notifyAdmins(complaint);
  }

  await Notification.create({
    recipient: department.head,
    message: `Complaint "${complaint.title}" (ID: ${complaint._id}) has breached its SLA deadline and been escalated to you for action.`,
    type: "escalation",
    relatedComplaint: complaint._id
  });

  console.log(
    `[Escalation] Notified department head (${department.head}) for complaint ${complaint._id}`
  );
}

/**
 * Notify all admin users about a complaint that has been escalated beyond
 * the department head.
 */
async function notifyAdmins(complaint) {
  const admins = await User.find({ role: "admin" }).select("_id");

  if (admins.length === 0) {
    console.warn("[Escalation] No admin users found to notify");
    return;
  }

  const notifications = admins.map((admin) => ({
    recipient: admin._id,
    message: `Complaint "${complaint.title}" (ID: ${complaint._id}) has been escalated to admin level (escalation level ${complaint.escalationLevel}). Immediate attention required.`,
    type: "escalation",
    relatedComplaint: complaint._id
  }));

  await Notification.insertMany(notifications);

  console.log(
    `[Escalation] Notified ${admins.length} admin(s) for complaint ${complaint._id}`
  );
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------
module.exports = { runEscalationCheck };