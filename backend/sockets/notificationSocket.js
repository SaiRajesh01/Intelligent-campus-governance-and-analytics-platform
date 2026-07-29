const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

// ---------------------------------------------------------------------------
// Socket.io Initialisation
// ---------------------------------------------------------------------------
// Attaches Socket.io to the HTTP server, authenticates connecting clients via
// their JWT (sent as `auth.token`), and joins each socket to a room named
// after the user's ID so we can emit targeted real-time notifications.
//
// Client-side connection example:
//   const socket = io("http://localhost:5000", {
//     auth: { token: "<JWT>" }
//   });
//   socket.on("notification", (data) => { /* handle */ });
// ---------------------------------------------------------------------------

function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // ── Authentication middleware ────────────────────────────────────────────
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Authentication error: no token provided"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded; // { id, role, ... }
      next();
    } catch (err) {
      return next(new Error("Authentication error: invalid token"));
    }
  });

  // ── Connection handler ──────────────────────────────────────────────────
  io.on("connection", (socket) => {
    const userId = socket.user.id;

    // Join a private room named after the user's ID
    socket.join(userId);
    console.log(
      `[Socket] User ${userId} connected (socket ${socket.id}), joined room "${userId}"`
    );

    // Optional: client can explicitly join their room again (reconnect case)
    socket.on("join", (roomId) => {
      if (roomId === userId) {
        socket.join(roomId);
      }
    });

    socket.on("disconnect", (reason) => {
      console.log(
        `[Socket] User ${userId} disconnected (socket ${socket.id}): ${reason}`
      );
    });
  });

  return io;
}

module.exports = initSocket;