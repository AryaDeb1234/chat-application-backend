// run command: npm run server

require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const passport = require("passport");
const http = require("http");
const socketio = require("socket.io");
const cors = require("cors");

require("./config/passport")(passport);

const app = express();


const testroute = require("./routes/test");
const authRouter = require("./routes/auth");
const chatRouter = require("./routes/chat");
const messageRouter = require("./routes/message");
const userRouter = require("./routes/user");


app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(passport.initialize());


app.get("/", (req, res) => {
  res.json("API working");
});



mongoose
  .connect(process.env.DB_URL)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));


const server = http.createServer(app);


const io = socketio(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Make io available in controllers
app.use((req, res, next) => { 
  req.io = io;
  next();
});
 
// const socketInit = require("./socket");
// socketInit(io);


require("./socket")(io);


app.use("/test", testroute);
app.use("/auth", authRouter);
app.use("/chat", chatRouter);
app.use("/message", messageRouter);
app.use("/user", userRouter);


app.use((req, res) => {
  res.status(404).send("Not Found");
});




server.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
}); 
