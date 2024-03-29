let users = [];

const editData = (data, id, call) => {
  const newData = data.map((item) =>
    item.id === id ? { ...item, call } : item
  );
  return newData;
};

const socketServer = (socket) => {
  // Connect - Disconnect
  socket.on("joinUser", (user) => {
    users.push({
      id: user._id,
      socketId: socket.id,
      followers: user.followers,
    });
  });
  socket.on("disconnect", () => {
    const data = users.find((user) => user.socketId === socket.id);
    if (data) {
      const clients = users.filter((user) =>
        data.followers.find((item) => item._id === user.id)
      );
      if (clients.length > 0) {
        clients.forEach((client) => {
          socket.to(`${client.socketId}`).emit("checkUserOffline", data.id);
        });
      }
    }

    if (data?.call) {
      const callUser = users.find((user) => user.id === data.call);
      if (callUser) {
        users = editData(users, callUser.id, null);
        socket.to(`${callUser.socketId}`).emit("callerDisconnect");
      }
    }

    users = users.filter((user) => user.socketId !== socket.id);
  });

  // Like
  socket.on("likePost", (newPost) => {
    const ids = [...newPost.postedBy.followers, newPost.postedBy._id];
    const clients = users.filter((user) => ids.includes(user.id));

    if (clients.length > 0) {
      clients.forEach((client) => {
        socket.to(`${client.socketId}`).emit("likeToClient", newPost);
      });
    }
  });

  socket.on("unLikePost", (newPost) => {
    const ids = [...newPost.postedBy.followers, newPost.postedBy._id];
    const clients = users.filter((user) => ids.includes(user.id));

    if (clients.length > 0) {
      clients.forEach((client) => {
        socket.to(`${client.socketId}`).emit("unLikeToClient", newPost);
      });
    }
  });

  // comment
  socket.on("createComment", (newPost) => {
    const ids = [...newPost.postedBy.followers, newPost.postedBy._id];
    const clients = users.filter((user) => ids.includes(user.id));

    if (clients.length > 0) {
      clients.forEach((client) => {
        socket.to(`${client.socketId}`).emit("createCommentToClient", newPost);
      });
    }
  });

  socket.on("deleteComment", (newPost) => {
    const ids = [...newPost.postedBy.followers, newPost.postedBy._id];
    const clients = users.filter((user) => ids.includes(user.id));

    if (clients.length > 0) {
      clients.forEach((client) => {
        socket.to(`${client.socketId}`).emit("deleteCommentToClient", newPost);
      });
    }
  });

  // Notifications
  socket.on("createNotify", (msg) => {
    const client = users.find((user) => msg.recipients.includes(user.id));
    client && socket.to(`${client.socketId}`).emit("createNotifyToClient", msg);
  });

  socket.on("removeNotify", (msg) => {
    const client = users.filter((user) => msg.recipients.includes(user.id));
    client && socket.to(`${client.socketId}`).emit("removeNotifyToClient", msg);
  });

  // Message/chat
  socket.on("addMessage", (msg) => {
    const user = users.find((user) => user.id === msg.recipient);
    user && socket.to(`${user.socketId}`).emit("addMessageToClient", msg);
  });

  // check User Online / Offline
  socket.on("checkUserOnline", (data) => {
    const following = users.filter((user) =>
      data.following.find((item) => item._id === user.id)
    );
    socket.emit("checkUserOnlineToMe", following);

    const clients = users.filter((user) =>
      data.followers.find((item) => item._id === user.id)
    );

    if (clients.length > 0) {
      clients.forEach((client) => {
        socket
          .to(`${client.socketId}`)
          .emit("checkUserOnlineToClient", data._id);
      });
    }
  });

  // call
  socket.on("callUser", (data) => {
    users = editData(users, data.sender, data.recipient);
    const client = users.find((user) => user.id === data.recipient);

    if (client) {
      if (client.call) {
        users = editData(users, data.sender, null);
        socket.emit("userBusy", data);
      } else {
        users = editData(users, data.recipient, data.sender);
        socket.to(`${client.socketId}`).emit("callUserToClient", data);
      }
    }
  });

  socket.on("endCall", (data) => {
    const client = users.find((user) => user.id === data.sender);

    if (client) {
      socket.to(`${client.socketId}`).emit("endCallToClient", data);
      users = editData(users, client.id, null);

      if (client.call) {
        const clientCall = users.find((user) => user.id === client.call);
        clientCall &&
          socket.to(`${clientCall.socketId}`).emit("endCallToClient", data);
        users = editData(users, client.call, null);
      }
    }
  });
};

module.exports = socketServer;
