const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  complaint: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Complaint",
    required: true
  },

  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },

  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },

  comment: {
    type: String,
    trim: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Feedback", feedbackSchema);
