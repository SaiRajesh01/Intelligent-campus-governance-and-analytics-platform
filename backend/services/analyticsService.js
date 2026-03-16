// analyticsService.js - starter file
const Complaint = require("../models/Complaint");

exports.getAnalytics = async () => {

  const totalComplaints = await Complaint.countDocuments();

  const resolvedComplaints = await Complaint.countDocuments({
    status: "resolved"
  });

  const pendingComplaints = await Complaint.countDocuments({
    status: "pending"
  });

  const escalatedComplaints = await Complaint.countDocuments({
    status: "escalated"
  });

  return {
    totalComplaints,
    resolvedComplaints,
    pendingComplaints,
    escalatedComplaints
  };
};