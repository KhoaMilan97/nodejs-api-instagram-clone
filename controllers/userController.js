const Users = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendEmail = require("./sendMail");

const userController = {
  register: async (req, res) => {
    try {
      const { email, fullname, username, password } = req.body;

      if (!validateEmail(email))
        return res.status(400).json({ msg: "Email is invalid." });

      const newUsername = username.toLowerCase().replace(/\s/g, "");
      const user_newUsername = await Users.findOne({ username: newUsername });
      if (user_newUsername)
        return res.status(400).json({ msg: "This username already exists." });
      const user_email = await Users.findOne({ email });
      if (user_email)
        return res.status(400).json({ msg: "This email already exists." });
      if (password.length < 6)
        return res
          .status(400)
          .json({ msg: "Password must be at least 6 characters." });

      const passwordHash = await bcrypt.hash(password, 12);

      const newUser = new Users({
        email,
        fullname,
        username: newUsername,
        password: passwordHash,
      });

      const accessToken = createAccessToken({ id: newUser._id });
      const refreshToken = createRefreshToken({ id: newUser._id });

      res.cookie("refreshtoken", refreshToken, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000,
        path: "/api/refresh-token",
      });

      await newUser.save();

      res.json({
        msg: "Register Success",
        accessToken,
        user: {
          ...newUser._doc,
          password: "",
        },
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await Users.findOne({ email }).populate(
        "followers following",
        "-password"
      );
      if (!user)
        return res.status(400).json({ msg: "This email doesn't exists." });
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.status(400).json({ msg: "Password is incorrect." });

      const accessToken = createAccessToken({ id: user._id });
      const refreshToken = createRefreshToken({ id: user._id });

      res.cookie("refreshtoken", refreshToken, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000,
        path: "/api/refresh-token",
      });

      res.json({
        msg: "Login Success",
        accessToken,
        user: {
          ...user._doc,
          password: "",
        },
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  logout: async (req, res) => {
    try {
      res.clearCookie("refreshtoken", { path: "/api/refresh-token" });
      res.json({ msg: "Logged out" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  generateAccessToken: async (req, res) => {
    try {
      const refreshToken = req.cookies.refreshtoken;
      if (!refreshToken)
        return res.status(400).json({ msg: "Please login now!" });
      jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, result) => {
          if (err) return res.status(400).json({ msg: "Token is invalid." });
          const user = await Users.findById(result.id)
            .select("-password")
            .populate("followers following", "-password");

          if (!user)
            return res.status(400).json({ msg: "This user doesn't exists." });
          const accessToken = createAccessToken({ id: result.id });
          res.json({
            accessToken,
            user,
          });
        }
      );
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;
      const user = await Users.findOne({ email });
      if (!user)
        return res.status(400).json({ msg: "This email doesn't exists." });

      const accessToken = createAccessToken({ id: user._id });
      const url = `${process.env.CLIENT_URL}/reset-password/${accessToken}`;
      await sendEmail(email, url, "Reset Password");

      res.json({ msg: "Re-send the password. Please check your email." });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  resetPassword: async (req, res) => {
    try {
      const { password } = req.body;
      const hashPassword = await bcrypt.hash(password, 12);
      const user = await Users.findByIdAndUpdate(req.user.id, {
        password: hashPassword,
      });
      res.json({ msg: "Password Successfully changed!" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  checkPassword: async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await Users.findOne({ email }).populate(
        "followers following",
        "-password"
      );
      if (!user)
        return res.status(400).json({ msg: "This email doesn't exists." });
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.status(400).json({ msg: "Old Password is incorrect." });

      res.json({ ok: true });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
};

function validateEmail(email) {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

const createAccessToken = (payload) => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1d",
  });
};

const createRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "30d",
  });
};

module.exports = userController;
