require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const fs = require("fs");
const socketServer = require("./socketServer");
const { ExpressPeerServer } = require("peer");

const app = express();
app.use(express.json({ limit: "2mb" }));
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(cookieParser());

// socket
const http = require("http").createServer(app);
const io = require("socket.io")(http);
io.on("connection", (socket) => {
  socketServer(socket);
});

ExpressPeerServer(http, { path: "/" });

fs.readdirSync("./routes").map((route) =>
  app.use("/api", require(`./routes/${route}`))
);

//connect to mongodb
const URI = process.env.MONGODBURI;
mongoose.connect(
  URI,
  {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err) => {
    if (err) throw err;
    console.log("Connected to mongodb");
  }
);

const PORT = process.env.PORT || 5000;

http.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
