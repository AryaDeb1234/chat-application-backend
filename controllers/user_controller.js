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
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // avatar handling
    let avatarUrl = user.avatar;

    if (req.file) {
      const result = await uploadcloudinary(req.file.path);
      avatarUrl = result.secure_url;

      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.warn("Temp file delete failed:", req.file.path);
      }
    }

    // update only existing schema fields
    user.username = username || user.username;
    user.phone = phone || user.phone;
    user.bio = bio || user.bio;
    user.avatar = avatarUrl;

    await user.save();

    const safeUser = user.toObject();
    delete safeUser.hash;
    delete safeUser.salt;

    res.status(200).json({
      success: true,
      user: safeUser
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Something went wrong"
    });
  }
};


const searchUsers = async (req, res) => {
  const keyword = req.query.query
    ? {
        $or: [
          { username: { $regex: req.query.query, $options: "i" } },
          { email: { $regex: req.query.query, $options: "i" } }
        ]
      }
    : {};

  const users = await User.find(keyword)
    .find({ _id: { $ne: req.user._id } })
    .select("-hash -salt");

  res.status(200).json(users);
};

module.exports = {
  getMe,
  updateProfile,
  searchUsers
};
