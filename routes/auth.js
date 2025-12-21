var express = require("express");

var router = express();
var user = require("../models/user");
var passport = require("passport");
const authcontroller=require("../controllers/auth_controller")


router.post("/login",authcontroller.login);

router.post("/register",authcontroller.register);

router.get("/current_user",passport.authenticate("jwt", { session: false }),authcontroller.current_user);

module.exports = router;
