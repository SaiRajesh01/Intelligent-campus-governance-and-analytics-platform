const Complaint = require("../models/Complaint");
const Department = require("../models/Department");
const Feedback = require("../models/Feedback");
const aiCategorization = require("../services/aiCategorizationService");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Default SLA hours by urgency (fallback when the department has no slaHours).
 */
const URGENCY_SLA_HOURS = {
  low: 72,
  medium: 48,
  high: 24,
  critical: 6
};

/**
 * Compute the SLA deadline based on department.slaHours or urgency fallback.
 * @param {object|null} department  - populated Department document (may be null)
 * @param {string}      urgency    - one of low | medium | high | critical
 * @returns {Date}
 */
function computeSlaDeadline(department, urgency) {
  const hours =
    department && department.slaHours
      ? department.slaHours
      : URGENCY_SLA_HOURS[urgency] || URGENCY_SLA_HOURS.medium;

  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

/**
 * Strip submittedBy / createdBy from a complaint POJO when the complaint is
 * anonymous and the requesting user is NOT an admin.
 */
function sanitizeAnonymous(complaintObj, requestingUserRole) {
  if (complaintObj.isAnonymous && requestingUserRole !== "admin") {
    complaintObj.submittedBy = undefined;
    complaintObj.createdBy = undefined;
  }
  return complaintObj;
}

// ---------------------------------------------------------------------------
// 1. createComplaint
// ---------------------------------------------------------------------------
// POST /api/complaints
// Body: { title, description, category?, urgency?, isAnonymous? }
// ---------------------------------------------------------------------------
exports.createComplaint = async (req, res) => {
  try {
    const { title, description, category, urgency, isAnonymous } = req.body;

    if (!title || !description) {
      return res
        .status(400)
        .json({ message: "Title and description are required" });
    }

    // AI-based department assignment
    const departmentId = await aiCategorization(description);
    const department = await Department.findById(departmentId);

    // Compute SLA deadline
    const effectiveUrgency = urgency || "medium";
    const slaDeadline = computeSlaDeadline(department, effectiveUrgency);

    // Build complaint document
    const complaintData = {
      title,
      description,
      category: category || undefined,
      urgency: effectiveUrgency,
      department: departmentId,
      slaDeadline,
      isAnonymous: !!isAnonymous,
      // Always store submittedBy internally for audit; visibility is
      // controlled at read-time.
      submittedBy: req.user.id
    };

    const complaint = await Complaint.create(complaintData);

    // Increment department complaintCount
    if (department) {
      department.complaintCount = (department.complaintCount || 0) + 1;
      await department.save();
    }

    // Sanitize response for anonymous complaints
    const result = sanitizeAnonymous(complaint.toJSON(), req.user.role);

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------------------------------------------------------------------------
// 2. getComplaints
// ---------------------------------------------------------------------------
// GET /api/complaints?status=open&category=wifi&department=<id>&urgency=high
// Role-based visibility:
//   - student        → only their own complaints
//   - departmentHead → complaints assigned to their department
//   - admin          → all complaints
// ---------------------------------------------------------------------------
exports.getComplaints = async (req, res) => {
  try {
    const { status, category, department, urgency } = req.query;
    const filter = {};

    // Optional query filters
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (department) filter.department = department;
    if (urgency) filter.urgency = urgency;

    // Role-based scoping
    if (req.user.role === "student") {
      filter.submittedBy = req.user.id;
    } else if (req.user.role === "departmentHead") {
      // departmentHead sees complaints routed to their department
      if (req.user.department) {
        filter.department = req.user.department;
      }
    }
    // admin: no extra filter — sees everything

    const complaints = await Complaint.find(filter)
      .populate("submittedBy", "name email")
      .populate("department", "name slaHours")
      .sort({ createdAt: -1 });

    // Sanitize anonymous complaints
    const sanitized = complaints.map((c) =>
      sanitizeAnonymous(c.toJSON(), req.user.role)
    );

    res.json(sanitized);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------------------------------------------------------------------------
// 3. getComplaintById
// ---------------------------------------------------------------------------
// GET /api/complaints/:id
// ---------------------------------------------------------------------------
exports.getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate("submittedBy", "name email")
      .populate("department", "name slaHours");

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Enforce role-based access
    if (
      req.user.role === "student" &&
      String(complaint.submittedBy?._id || complaint.submittedBy) !==
        String(req.user.id)
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this complaint" });
    }

    if (
      req.user.role === "departmentHead" &&
      String(complaint.department?._id || complaint.department) !==
        String(req.user.department)
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this complaint" });
    }

    const result = sanitizeAnonymous(complaint.toJSON(), req.user.role);

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------------------------------------------------------------------------
// 4. updateStatus
// ---------------------------------------------------------------------------
// PUT /api/complaints/:id/status
// Body: { status }
// Restricted to admin & departmentHead (enforced via authorize middleware).
// Logs every status change with a timestamp on the document.
// ---------------------------------------------------------------------------
exports.updateStatus = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // departmentHead can only update complaints in their own department
    if (
      req.user.role === "departmentHead" &&
      String(complaint.department) !== String(req.user.department)
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this complaint" });
    }

    const previousStatus = complaint.status;
    const newStatus = req.body.status;

    if (!newStatus) {
      return res.status(400).json({ message: "Status is required" });
    }

    complaint.status = newStatus;

    // Log the status change (stored in statusHistory array)
    if (!complaint.statusHistory) {
      complaint.statusHistory = [];
    }
    complaint.statusHistory.push({
      from: previousStatus,
      to: newStatus,
      changedBy: req.user.id,
      changedAt: new Date()
    });

    // Mark resolvedAt when status becomes "resolved"
    if (newStatus === "resolved" && previousStatus !== "resolved") {
      complaint.resolvedAt = new Date();

      // Increment department resolvedCount
      const dept = await Department.findById(complaint.department);
      if (dept) {
        dept.resolvedCount = (dept.resolvedCount || 0) + 1;
        await dept.save();
      }
    }

    await complaint.save();

    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------------------------------------------------------------------------
// 5. deleteComplaint
// ---------------------------------------------------------------------------
// DELETE /api/complaints/:id
// Admin only (enforced via authorize middleware).
// ---------------------------------------------------------------------------
exports.deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    await complaint.deleteOne();

    res.json({ message: "Complaint removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------------------------------------------------------------------------
// 6. addFeedback
// ---------------------------------------------------------------------------
// POST /api/complaints/:id/feedback
// Body: { rating, comment? }
// Student submits feedback on a resolved complaint.
// ---------------------------------------------------------------------------
exports.addFeedback = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Only the original submitter may leave feedback
    if (String(complaint.submittedBy) !== String(req.user.id)) {
      return res
        .status(403)
        .json({ message: "Only the complaint submitter can leave feedback" });
    }

    // Complaint must be resolved or closed
    if (!["resolved", "closed"].includes(complaint.status)) {
      return res
        .status(400)
        .json({ message: "Feedback can only be given on resolved or closed complaints" });
    }

    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating between 1 and 5 is required" });
    }

    // Prevent duplicate feedback
    const existing = await Feedback.findOne({
      complaint: complaint._id,
      submittedBy: req.user.id
    });
    if (existing) {
      return res
        .status(409)
        .json({ message: "Feedback already submitted for this complaint" });
    }

    const feedback = await Feedback.create({
      complaint: complaint._id,
      submittedBy: req.user.id,
      rating,
      comment: comment || undefined
    });

    res.status(201).json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};