
var passport = require("passport");
var { genpassword, validpassword, issuejwt } = require("../lib/passwordutilis");
var user = require("../models/user");
const generateUserCode = require("../utlis/generateCode");

async function login(req, res,next) {
  try {
    const { username, password } = req.body;

    const existuser = await user.findOne({ username: username });

    if (!existuser) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    const isValid = validpassword(password, existuser.hash, existuser.salt);

    if (isValid) {
      const tokenObject = issuejwt(existuser);
 
      return res.status(200).json({
        success: true,
        message: "Login successful",
        user: {
          id: existuser._id,
          username: existuser.username,
        },
        token: tokenObject.token,
        expires: tokenObject.expires,
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Incorrect password",
      });
    }
  } catch (err) {
    //console.error("Error in login route:", err);
    return res.status(500).json({
      success: false,
      message: "Server error during login",
      error: err.message,
    });
  }
};


async function register(req, res, next) {
  let { username, password } = req.body;

  try {
    // 1️⃣ Check if username already exists
    let existuser = await user.findOne({ username });
    if (existuser) {
      return res.status(400).json({
        success: false,
        message: "User already exists. Please login."
      });
    }

    // 2️⃣ Generate password hash
    let { salt, hash } = genpassword(password);

    // 3️⃣ Generate UNIQUE 6-digit user code
    let userCode;
    let isUnique = false;

    while (!isUnique) {
      userCode = generateUserCode();
      const codeExists = await user.findOne({ userCode });
      if (!codeExists) isUnique = true;
    }

    // 4️⃣ Create new user
    let newuser = new user({
      username,
      hash,
      salt,
      userCode
    });

    const saveduser = await newuser.save();

    // 5️⃣ Issue JWT
    const jwt = issuejwt(saveduser);

    // 6️⃣ Respond
    res.status(201).json({
      success: true,
      message: "Registration successful!",
      user: {
        id: saveduser._id,
        username: saveduser.username,
        userCode: saveduser.userCode // 🔥 IMPORTANT
      },
      token: jwt.token,
      expires: jwt.expires
    });

  } catch (err) {
    console.error("Error during registration:", err);
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
      error: err.message
    });
  }
}

function current_user(req, res) {
  // Send back user info if JWT is valid
  return res.status(200).json({
    loggedIn: true,
    user: {
      id: req.user._id,
      username: req.user.username
    }
  });
};

module.exports={login,register,current_user};