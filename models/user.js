const mongoose = require("mongoose");

const userSchema = new mongoose.Schema( //first name,last name, (unique id),
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },

    userCode: {
      type: String,
      unique: true,
      index: true,
    },

    email: {
      type: String,
      unique: true,
      lowercase: true,
    },

    phone: String,

    hash: String,
    salt: String,

    avatar: {
      type: String,
      default: "",
    },

    bio: {
      type: String,
      default: "",
    },
    contacts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
