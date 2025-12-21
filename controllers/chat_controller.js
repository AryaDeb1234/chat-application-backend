const Chat = require("../models/chat");
const User = require("../models/user");


const accessChat = async (req, res) => {
  try {
    const { userId } = req.body; // ID of other user

    if (!userId) {
      return res.status(400).json({ message: "UserId is required" });
    }

    let chat = await Chat.findOne({
      isGroupChat: false,
      users: {
        $all: [req.user._id, userId]
      }
    })
      .populate("users", "-hash -salt")
      .populate("latestMessage");

    if (chat) {
      return res.status(200).json(chat);
    }

    const newChat = await Chat.create({
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId]
    });

    const fullChat = await Chat.findById(newChat._id)
      .populate("users", "-hash -salt");

    res.status(201).json(fullChat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to access chat" });
  }
};


const fetchChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      users: { $elemMatch: { $eq: req.user._id } }
    })
      .populate("users", "-hash -salt")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    res.status(200).json(chats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch chats" });
  }
};

module.exports = {
  accessChat,
  fetchChats
};
