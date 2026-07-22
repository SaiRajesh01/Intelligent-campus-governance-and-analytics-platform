const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  message: {
    type: String,
    required: true
  },

  type: {
    type: String,
    trim: true
  },

  relatedComplaint: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Complaint"
  },

  isRead: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });

// ---------------------------------------------------------------------------
// Backward-compatibility virtuals: existing controllers use `user` and `read`
// ---------------------------------------------------------------------------
notificationSchema.virtual("user").get(function () {
  return this.recipient;
});
notificationSchema.virtual("user").set(function (value) {
  this.recipient = value;
});

notificationSchema.virtual("read").get(function () {
  return this.isRead;
});
notificationSchema.virtual("read").set(function (value) {
  this.isRead = value;
});

// Ensure virtuals appear in JSON / Object output
notificationSchema.set("toJSON", { virtuals: true });
notificationSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Notification", notificationSchema);