// notificationSocket.js - starter file
const socketIO = require("socket.io");

function initSocket(server) {

  const io = socketIO(server, {
    cors: { origin: "*" }
  });

  io.on("connection", socket => {
    console.log("User connected", socket.id);

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });

  return io;
}

module.exports = initSocket;