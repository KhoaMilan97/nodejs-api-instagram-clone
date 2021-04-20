let users = [];

const socketServer = (socket) => {
  // Connect - Disconnect
  socket.on("joinUser", (id) => {
    users.push({ id, socketId: socket.id });
  });
  socket.on("disconnect", () => {
    users = users.filter((user) => user.socketId !== socket.id);
  });

  // Likes
};

module.exports = socketServer;
