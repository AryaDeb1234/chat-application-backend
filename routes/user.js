var express = require("express");

var router = express();
var user = require("../models/user");
const usercontroller=require("../controllers/user_controller")
const upload = require("../middlewares/multer");
const { uploadcloudinary } = require("../utlis/cloudinary");
const protect=require("../middlewares/auth_middleware");

router.get("/me", protect, usercontroller.getMe); 
router.put("/update_profile", protect,upload.single("avatar"), usercontroller.updateProfile);
router.get("/search", protect, usercontroller.searchUsers);

module.exports = router;
