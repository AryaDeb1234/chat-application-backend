var express = require("express");

var router = express();
var user = require("../models/user");
const statuscontroller=require("../controllers/status_controller")
const upload = require("../middlewares/multer");
const { uploadcloudinary } = require("../utlis/cloudinary");
const protect=require("../middlewares/auth_middleware");

router.post("/upload",protect,upload.single("media"),statuscontroller.uploadStatus);
router.get("/fetch",protect,statuscontroller.getStatuses);
router.post("/view/:statusId", protect, statuscontroller.markStatusViewed);
router.get("/viewers/:statusId", protect, statuscontroller.getStatusViewers);

module.exports = router;