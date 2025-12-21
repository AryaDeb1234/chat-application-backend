const Message = require("../models/message");
const Chat = require("../models/chat");

const sendMessage = async (req, res) => {
  try {
    const { content, chatId } = req.body;

    if (!content || !chatId) {
      return res.status(400).json({ message: "content and chatId required" });
    }

    // Create message
    let message = await Message.create({
      sender: req.user._id,
      content,
      chat: chatId
    });

    // Populate sender & chat
    message = await message.populate("sender", "username avatar");
    message = await message.populate({
  path: "chat",
  populate: { path: "users", select: "username avatar _id" }
});



    // Update latest message in chat
    await Chat.findByIdAndUpdate(chatId, {
      latestMessage: message._id
    });

    // SOCKET EVENT
     const chat = message.chat;
    chat.users.forEach((user) => {
      if (user._id.toString() === req.user._id.toString()) return;
      req.io.to(user._id.toString()).emit("message received", message);
    });

    res.status(201).json(message);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send message" });
  }
};

const fetchMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      chat: req.params.chatId
    })
      .populate("sender", "username avatar")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};

module.exports = { sendMessage, fetchMessages };
