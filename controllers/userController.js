const { Mongoose } = require("mongoose");
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
      const users = await Users.findOne({ username }).select("-password");

      res.json(users);
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
};

module.exports = userController;
