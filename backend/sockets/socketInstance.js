// ---------------------------------------------------------------------------
// Shared Socket.io Instance
// ---------------------------------------------------------------------------
// This module acts as a singleton holder for the Socket.io `io` instance.
// It avoids circular dependencies and the need for `app.set("io", io)`.
//
// Usage:
//   const { getIO } = require("../sockets/socketInstance");
//   const io = getIO();
//   io.to(userId).emit("notification", data);
// ---------------------------------------------------------------------------

let io = null;

/**
 * Store the Socket.io server instance (called once at startup).
 * @param {import("socket.io").Server} ioInstance
 */
function setIO(ioInstance) {
  io = ioInstance;
}

/**
 * Retrieve the Socket.io server instance.
 * @returns {import("socket.io").Server|null}
 */
function getIO() {
  return io;
}

/**
 * Emit a real-time notification to a specific user's socket room.
 * Safe to call even if Socket.io is not initialised yet (no-ops gracefully).
 *
 * @param {string} recipientId - The user's _id (used as the room name)
 * @param {object} notification - The Notification document (or plain object)
 */
function emitNotification(recipientId, notification) {
  if (!io) return;
  io.to(String(recipientId)).emit("notification", notification);
}

module.exports = { setIO, getIO, emitNotification };
