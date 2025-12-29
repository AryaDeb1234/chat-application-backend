const User = require("../models/user");
const upload = require("../middlewares/multer");
const { uploadcloudinary } = require("../utlis/cloudinary");

const getMe = async (req, res) => {
  const user = await User.findById(req.user._id).select("-hash -salt");
  res.status(200).json(user);
};


const updateProfile = async (req, res) => {
  try {
    const { username, phone, bio } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false });
    }

    if (req.file) {
      const result = await uploadcloudinary(req.file.path);
      user.avatar = result.secure_url;
    }

    user.username = username || user.username;
    user.phone = phone || user.phone;
    user.bio = bio || user.bio;

    await user.save();

    const safeUser = user.toObject();
    delete safeUser.hash;
    delete safeUser.salt;

    res.json({ success: true, user: safeUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};



const searchUsers = async (req, res) => {
  try {
    const userCode = req.query.code;

    if (!userCode) {
      return res.status(400).json({
        message: "User code required"
      });
    }

    const foundUser = await User.findOne({
      userCode: userCode,
      _id: { $ne: req.user._id }
    }).select("_id username avatar userCode");

    if (!foundUser) {
      return res.status(404).json({
        message: "No user found with this code"
      });
    }

    res.status(200).json(foundUser);

  } catch (err) {
    res.status(500).json({
      message: "Search failed",
      error: err.message
    });
  }
};



module.exports = {
  getMe,
  updateProfile,
  searchUsers
};
