var express = require("express");

var router = express();
var user = require("../models/user");
const messagecontroller=require("../controllers/message_controller")
const protect = require("../middlewares/auth_middleware");

router.post("/send",protect,messagecontroller.sendMessage);

router.get("/:chatId",protect,messagecontroller.fetchMessages);


module.exports = router;
