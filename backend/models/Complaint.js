const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },

  category: {
    type: String,
    trim: true
  },

  urgency: {
    type: String,
    enum: ["low", "medium", "high", "critical"],
    default: "medium"
  },

  status: {
    type: String,
    enum: ["open", "in-progress", "escalated", "resolved", "closed"],
    default: "open"
  },

  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },

  isAnonymous: {
    type: Boolean,
    default: false
  },

  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department"
  },

  slaDeadline: {
    type: Date
  },

  escalationLevel: {
    type: Number,
    default: 0
  },

  attachments: {
    type: [String],
    default: []
  },

  resolvedAt: Date

}, { timestamps: true });

// ---------------------------------------------------------------------------
// Backward-compatibility virtual: existing controllers use `createdBy`
// ---------------------------------------------------------------------------
complaintSchema.virtual("createdBy").get(function () {
  return this.submittedBy;
});
complaintSchema.virtual("createdBy").set(function (value) {
  this.submittedBy = value;
});

// Ensure virtuals appear in JSON / Object output
complaintSchema.set("toJSON", { virtuals: true });
complaintSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Complaint", complaintSchema);