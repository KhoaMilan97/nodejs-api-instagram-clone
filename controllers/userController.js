const Users = require("../models/userModel");

const userController = {
  search: async (req, res) => {
    try {
      const param = req.query.s;
      const users = await Users.find({
        $or: [
          { fullname: { $regex: param, $options: "i" } },
          { username: { $regex: param } },
        ],
      });

      res.json({ users });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getUser: async (req, res) => {
    try {
      const { username } = req.params;
      const users = await Users.findOne({ username })
        .populate("followers following saved", "-password")
        .select("-password");

      res.json(users);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        username,
        fullname,
        website,
        description,
        phone,
        gender,
      } = req.body;

      if (!username)
        return res.status(400).json({ msg: "You need provide username." });

      let newUsername = username.toLowerCase().replace(/\s/g, "");

      const oldUser = await Users.findById(id);
      if (oldUser.username !== newUsername) {
        const checkUsername = await Users.findOne({ username: newUsername });
        if (checkUsername)
          return res.status(400).json({ msg: "This username already exists." });
      }

      if (phone && !validatePhone(phone))
        return res.status(400).json({ msg: "Phone number incorrect format." });
      if (website && !validURL(website))
        return res
          .status(400)
          .json({ msg: "Website url must be a valid URL." });

      const user = await Users.findByIdAndUpdate(
        id,
        {
          username: newUsername,
          fullname,
          website,
          description,
          phoneNumber: phone,
          gender,
        },
        { new: true }
      );

      res.json(user);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  followUser: async (req, res) => {
    try {
      const { followId } = req.body;
      const doesFollowersAlreadyExist = await Users.findOne({
        _id: followId,
        followers: req.user.id,
      });
      const doesFolloweingAlreadyExist = await Users.findOne({
        _id: req.user.id,
        following: followId,
      });

      if (doesFollowersAlreadyExist && doesFolloweingAlreadyExist)
        return res
          .status(400)
          .json({ msg: "You are already following this user." });

      const userFollower = await Users.findByIdAndUpdate(
        followId,
        {
          $push: { followers: req.user.id },
        },
        { new: true }
      )
        .populate("followers following", "-password")
        .exec();

      const userFollowing = await Users.findByIdAndUpdate(
        req.user.id,
        {
          $push: { following: followId },
        },
        { new: true }
      )
        .populate("followers following", "-password")
        .exec();

      res.json({ userFollower, userFollowing });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  unfollowUser: async (req, res) => {
    try {
      const { followId } = req.body;
      const doesFollowersAlreadyExist = await Users.findOne({
        _id: followId,
        followers: req.user.id,
      });
      const doesFolloweingAlreadyExist = await Users.findOne({
        _id: req.user.id,
        following: followId,
      });

      if (!doesFollowersAlreadyExist && !doesFolloweingAlreadyExist)
        return res.status(400).json({
          msg: "You cannot stop following someone you do not already follow.",
        });

      const userFollower = await Users.findByIdAndUpdate(
        followId,
        {
          $pull: { followers: req.user.id },
        },
        { new: true }
      )
        .populate("followers following", "-password")
        .exec();

      const userFollowing = await Users.findByIdAndUpdate(
        req.user.id,
        {
          $pull: { following: followId },
        },
        { new: true }
      )
        .populate("followers following", "-password")
        .exec();

      res.json({ userFollower, userFollowing });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  savedPost: async (req, res) => {
    try {
      const { id } = req.params;
      const isSaved = await Users.findOne({
        _id: id,
        saved: req.body.id,
      });
      if (isSaved)
        return res.status(400).json({ msg: "You are already save this post" });
      const user = await Users.findByIdAndUpdate(
        id,
        {
          $push: { saved: req.body.id },
        },
        { new: true }
      ).populate("followers following", "-password");
      res.json(user);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  unsavedPost: async (req, res) => {
    try {
      const { id } = req.params;
      const user = await Users.findByIdAndUpdate(
        id,
        {
          $pull: { saved: req.body.id },
        },
        { new: true }
      ).populate("followers following", "-password");
      res.json(user);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  suggestUser: async (req, res) => {
    try {
      const { id } = req.params;
      const { following } = await Users.findById(id);
      following.push(id);

      const users_list = await Users.find({ _id: { $nin: following } });
      res.json(users_list);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
};

function validatePhone(phone) {
  const regex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
  return regex.test(phone);
}

function validURL(myURL) {
  var pattern = new RegExp(
    "^(https?:\\/\\/)?" + // protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|" + // domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // ip (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + //port
      "(\\?[;&amp;a-z\\d%_.~+=-]*)?" + // query string
      "(\\#[-a-z\\d_]*)?$",
    "i"
  );
  return pattern.test(myURL);
}

module.exports = userController;
