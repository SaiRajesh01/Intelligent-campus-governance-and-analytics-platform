const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },

  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department"
  },

  status: {
    type: String,
    enum: ["pending", "in-progress", "resolved", "escalated"],
    default: "pending"
  },

  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium"
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  resolvedAt: Date

}, { timestamps: true });

module.exports = mongoose.model("Complaint", complaintSchema);