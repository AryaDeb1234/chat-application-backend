require("dotenv").config();

const cloudinary = require("cloudinary").v2;
const fs = require("fs");

cloudinary.config({
  cloud_name: process.env.cloudinary_cloud_name,
  api_key: process.env.cloudinary_api_key,
  api_secret: process.env.cloudinary_api_secret,
});

const uploadcloudinary = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "avatars"
    });

    // delete temp file AFTER upload
    fs.unlink(filePath, () => {});

    return result;
  } catch (error) {
    fs.unlink(filePath, () => {});
    throw error;
  }
};

module.exports = {
  uploadcloudinary: uploadcloudinary,
};
