const Notification = require("../models/Notification");

// ---------------------------------------------------------------------------
// 1. getMyNotifications (paginated)
// ---------------------------------------------------------------------------
// GET /api/notifications?page=1&limit=20
// Returns the logged-in user's notifications, newest first.
// ---------------------------------------------------------------------------
exports.getMyNotifications = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const skip = (page - 1) * limit;

    const filter = { recipient: req.user.id };

    const [notifications, total] = await Promise.all([
      Notification.find(filter)
        .populate("relatedComplaint", "title status")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments(filter)
    ]);

    const unreadCount = await Notification.countDocuments({
      ...filter,
      isRead: false
    });

    res.json({
      notifications,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      unreadCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------------------------------------------------------------------------
// 2. markAsRead
// ---------------------------------------------------------------------------
// PUT /api/notifications/:id/read
// Marks a single notification as read.
// ---------------------------------------------------------------------------
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // Ensure the notification belongs to the authenticated user
    if (String(notification.recipient) !== String(req.user.id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    notification.isRead = true;
    await notification.save();

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------------------------------------------------------------------------
// 3. markAllAsRead
// ---------------------------------------------------------------------------
// PUT /api/notifications/read-all
// Marks every unread notification for the logged-in user as read.
// ---------------------------------------------------------------------------
exports.markAllAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      { $set: { isRead: true } }
    );

    res.json({
      message: "All notifications marked as read",
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------------------------------------------------------------------------
// 4. deleteNotification
// ---------------------------------------------------------------------------
// DELETE /api/notifications/:id
// Deletes a single notification belonging to the logged-in user.
// ---------------------------------------------------------------------------
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // Ensure the notification belongs to the authenticated user
    if (String(notification.recipient) !== String(req.user.id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await notification.deleteOne();

    res.json({ message: "Notification deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
