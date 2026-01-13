const redis = require("./config/redis");

const getOnlineUsers = async () => {
  const keys = await redis.keys("user:*:online");

  const onlineUserIds = keys.map((key) => key.split(":")[1]);
  return onlineUserIds;
};

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    const broadcastOnlineUsers = async () => {
      const users = await getOnlineUsers();
      io.emit("online users", users);
    };

    socket.on("setup", async (userId) => {
      socket.userId = userId;
      socket.join(userId);

      
      await redis.set(`user:${userId}:online`, socket.id, "EX", 60);
      await broadcastOnlineUsers();
      socket.emit("connected");

    });

    socket.on("heartbeat", async (userId) => {
      if (!userId) return;

      await redis.set(`user:${userId}:online`, socket.id, "EX", 60);
      await broadcastOnlineUsers();
      console.log(`Heartbeat refreshed in Redis for user: ${userId}`);
    });

    socket.on("send message", async (message) => {
      const userId = socket.userId;

      const key = `msg:limit:${userId}`;

      const count = await redis.incr(key);
      if (count === 1) {
        await redis.expire(key, 10);
      }

      if (count > 5) {
        return socket.emit("error", "Too many messages, slow down!");
      }


      const chatId = message.chat;
      const chatKey = `chat:${chatId}:messages`;

      await redis.lpush(chatKey, JSON.stringify(message));
      await redis.ltrim(chatKey, 0, 49);

      socket.in(message.chat).emit("message received", message);
    });

    socket.on("typing", (chatId) => {
      socket.in(chatId).emit("typing", chatId);
    });

    socket.on("stop typing", (chatId) => {
      socket.in(chatId).emit("stop typing");
    });

    socket.on("join chat", async (chatId) => {
      socket.join(chatId);

      const chatKey = `chat:${chatId}:messages`;

      const cachedMessages = await redis.lrange(chatKey, 0, -1);

      if (cachedMessages.length > 0) {
        const messages = cachedMessages
          .reverse()
          .map((msg) => JSON.parse(msg));

        socket.emit("recent messages", messages);
      }
    });

    socket.on("disconnect", async () => {
      if (socket.userId) {
       
        await redis.del(`user:${socket.userId}:online`);
        await broadcastOnlineUsers();
      }
      console.log("Socket disconnected");
    });
  });
};

// module.exports = (io) => {
//   io.on("connection", (socket) => {
//     console.log("Socket connected:", socket.id);

//     socket.on("setup", (userId) => {
//       socket.join(userId);
//       socket.emit("connected");
//     });

//     socket.on("typing", (chatId) => {
//       socket.in(chatId).emit("typing", chatId);
//     });

//     socket.on("stop typing", (chatId) => {
//       socket.in(chatId).emit("stop typing");
//     });

//     socket.on("join chat", (chatId) => {
//       socket.join(chatId);
//     });

//     socket.on("disconnect", () => {
//       console.log("Socket disconnected");
//     });
//   });
// };
