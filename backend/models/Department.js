const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },

  head: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  slaHours: {
    type: Number,
    default: 48
  },

  complaintCount: {
    type: Number,
    default: 0
  },

  resolvedCount: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model("Department", departmentSchema);