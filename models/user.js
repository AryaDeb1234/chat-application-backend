const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      unique: true,
      lowercase: true
    },

    phone:String,

    hash: String,
    salt: String,

    avatar: {
      type: String,
      default: ""
    },

    bio: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
