const Posts = require("../models/postModel");
const Users = require("../models/userModel");
const cloudinary = require("cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const postController = {
  createPost: async (req, res) => {
    try {
      const { title, images, postedBy } = req.body;
      const post = await new Posts({ title, images, postedBy }).save();

      res.json({ post });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getPost: async (req, res) => {
    try {
      const { userid } = req.params;
      const { limit, page } = req.query;
      const perPage = Number(limit) || 6;
      const currentPage = page || 1;

      const post = await Posts.find({ postedBy: userid })
        .skip((currentPage - 1) * perPage)
        .limit(perPage)
        .sort("-createdAt")
        .select("_id images");

      res.json({ post });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getSinglePost: async (req, res) => {
    try {
      const { id } = req.params;
      const post = await Posts.findById(id).populate("postedBy").exec();
      res.json({ post });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  followPost: async (req, res) => {
    try {
      const { id } = req.params;
      const { limit, page } = req.query;
      const perPage = Number(limit) || 6;
      const currentPage = page || 1;

      const followings = await Users.findById(id).select("following");
      const followingIds = followings.following;
      const posts = await Posts.find({ postedBy: { $in: followingIds } })
        .skip((currentPage - 1) * perPage)
        .limit(perPage)
        .populate("postedBy")
        .sort("-createdAt");

      res.json(posts);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  removePost: async (req, res) => {
    try {
      const { id } = req.params;
      const post = await Posts.findById(id);
      let images = post.images.map((img) => img.public_id);

      await Posts.findByIdAndDelete(id);
      // for (let image_id of images) {
      //   await cloudinary.uploader.destroy(image_id);
      // }

      images.forEach(async (image_id) => {
        await cloudinary.uploader.destroy(image_id);
      });

      res.json({ msg: "Delete Success" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  updatePost: async (req, res) => {
    try {
      const { images, title } = req.body;
      const { id } = req.params;

      const post = await Posts.findByIdAndUpdate(id, { title, images });

      res.json(post);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  likePost: async (req, res) => {
    try {
      const { id } = req.params;
      const isLiked = await Posts.findOne({
        _id: id,
        likes: req.body.id,
      });
      if (isLiked)
        return res.status(400).json({ msg: "You are already like this post." });
      const post = await Posts.findByIdAndUpdate(
        id,
        {
          $push: { likes: req.body.id },
        },
        { new: true }
      ).populate("postedBy");
      res.json(post);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  unLikePost: async (req, res) => {
    try {
      const { id } = req.params;
      const post = await Posts.findByIdAndUpdate(
        id,
        {
          $pull: { likes: req.body.id },
        },
        { new: true }
      ).populate("postedBy");
      res.json(post);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
};

module.exports = postController;
