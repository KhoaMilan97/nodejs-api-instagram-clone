const jwt = require("jsonwebtoken");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization");
    if (!token) return res.status(400).json({ msg: "Invalid Authorization" });
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) return res.status(400).json({ msg: "Invalid Authorization" });
      req.user = user;
      next();
    });
  } catch (err) {
    console.log(error);
    res.status(500).json({ msg: error.message });
  }
};

module.exports = auth;
