require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const fs = require("fs");

const app = express();
app.use(express.json({ limit: "2mb" }));
app.use(cors());
app.use(cookieParser());

//route
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
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
