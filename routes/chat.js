var express = require("express");

var router = express();
var user = require("../models/user");
const chatcontroller=require("../controllers/chat_controller")

const protect = require("../middlewares/auth_middleware");

router.post("/create", protect, chatcontroller.accessChat);
router.get("/fetch", protect, chatcontroller.fetchChats);

module.exports = router;
 