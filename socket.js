module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("setup", (userId) => {
      socket.join(userId);
      socket.emit("connected");
    });

    socket.on("typing", (chatId) => {
    socket.in(chatId).emit("typing", chatId);
  });
  socket.on("stop typing", (chatId) => {
  socket.in(chatId).emit("stop typing");
});

    socket.on("join chat", (chatId) => {
      socket.join(chatId);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });
  }); 
}

// module.exports = (io) => {
//   const onlineUsers = {};

//   io.on("connection", (socket) => {
//     console.log("Socket connected:", socket.id);

//     // User setup
//     socket.on("setup", (userId) => {
//       socket.join(userId);
//       onlineUsers[userId] = socket.id;
//       socket.emit("connected");
//       io.emit("online users", Object.keys(onlineUsers)); // broadcast online users
//     });

//     // Join chat room
//     socket.on("join chat", (chatId) => {
//       socket.join(chatId);
//       console.log(`Socket ${socket.id} joined chat: ${chatId}`);
//     });

//     // Typing indicator
//     socket.on("typing", (chatId) => {
//       socket.in(chatId).emit("typing", chatId);
//     });

//     socket.on("stop typing", (chatId) => {
//       socket.in(chatId).emit("stop typing", chatId);
//     });

//     // Handle message sending from controller
//     // socket.on("send message", (message) => {
//     //   const chatId = message.chat._id || message.chat;
//     //   message.chat.users.forEach((user) => {
//     //     if (user._id.toString() === message.sender._id.toString()) return;
//     //     socket.to(user._id.toString()).emit("message received", message);
//     //   });
//     // });

//     // Disconnect
//     socket.on("disconnect", () => {
//       for (let userId in onlineUsers) {
//         if (onlineUsers[userId] === socket.id) {
//           delete onlineUsers[userId];
//           break;
//         }
//       }
//       io.emit("online users", Object.keys(onlineUsers));
//       console.log("Socket disconnected:", socket.id);
//     });
//   });
// };
