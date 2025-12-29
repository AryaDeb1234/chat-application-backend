const Status = require("../models/status");
const { uploadcloudinary } = require("../utlis/cloudinary");
const User=require("../models/user")

const uploadStatus = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Media required" });
    }

    const { caption, visibility } = req.body;

    const result = await uploadcloudinary(req.file.path);

    const status = await Status.create({
      user: req.user._id,
      media: result.secure_url,
      caption: caption || "",
      visibility: visibility || "contacts",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    const user = await User.findById(req.user._id).select("contacts");

        user.contacts.forEach((contactId) => {
      req.io.to(contactId.toString()).emit("new status", {
        userId: req.user._id,
        statusId: status._id,
      });
    });

    
    req.io.to(req.user._id.toString()).emit("new status", {
      userId: req.user._id,
      statusId: status._id,
    });

    res.status(201).json({
      success: true,
      status,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

const getStatuses = async (req, res) => {
  try {
    const statuses = await Status.find({
      expiresAt: { $gt: new Date() },
      $or: [{ visibility: "everyone" }, { user: { $in: req.user.contacts } }],
    });

    res.status(200).json(statuses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false }); 
  }
};

const markStatusViewed = async (req, res) => {
  try {
    const { statusId } = req.params;
    const viewerId = req.user._id;

    const status = await Status.findById(statusId);

    if (!status) {
      return res.status(404).json({ message: "Status not found" });
    }

    
    if (status.user.toString() === viewerId.toString()) {
      return res.status(200).json({ success: true });
    }

    
    if (!status.viewers.includes(viewerId)) {
      status.viewers.push(viewerId);
      await status.save();

      
      req.io.to(status.user.toString()).emit("status viewed", {
        statusId,
        viewerId
      });
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

const getStatusViewers = async (req, res) => {
  try {
    const status = await Status.findById(req.params.statusId)
      .populate("viewers", "username avatar");

    if (!status) {
      return res.status(404).json({ message: "Status not found" });
    }

    //  Only owner can see viewers
    if (status.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    res.status(200).json({
      count: status.viewers.length,
      viewers: status.viewers
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};



module.exports = { uploadStatus, getStatuses,markStatusViewed,getStatusViewers };
