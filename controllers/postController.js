const Posts = require("../models/postModel");
const Users = require("../models/userModel");
const Comments = require("../models/commentModel");
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

      if (images.length < 1)
        return res.status(401).json({ msg: "Please add your photos" });
      let post = await new Posts({ title, images, postedBy }).save();
      post = await post.populate("postedBy", "-password").execPopulate();

      res.json({ post });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getPost: async (req, res) => {
    try {
      const { userid } = req.params;
      const { limit, page } = req.query;
      const perPage = Number(limit) || 12;
      const currentPage = page || 1;

      const post = await Posts.find({ postedBy: userid })
        .skip((currentPage - 1) * perPage)
        .limit(perPage)
        .sort("-createdAt");

      res.json({ post });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getSinglePost: async (req, res) => {
    try {
      const { id } = req.params;
      const post = await Posts.findById(id)
        .populate("postedBy likes", "-password")
        .populate({
          path: "comments",
          populate: {
            path: "user likes",
            select: "-password",
          },
        })
        .exec();

      if (!post)
        return res.status(400).json({ msg: "This post doesn't exist" });

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
      const currentPage = Number(page) || 1;

      const followings = await Users.findById(id).select("following");
      const followingIds = [...followings.following, id];
      const posts = await Posts.find({ postedBy: { $in: followingIds } })
        .skip((currentPage - 1) * perPage)
        .limit(perPage)
        .populate("postedBy likes", "-password")
        .populate({
          path: "comments",
          populate: {
            path: "user likes",
            select: "-password",
          },
        })
        .sort("-createdAt");

      res.json({ result: posts.length, posts });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  removePost: async (req, res) => {
    try {
      const { id } = req.params;
      const post = await Posts.findById(id);
      let images = post.images.map((img) => img.public_id);

      const result = await Posts.findOneAndRemove({
        _id: id,
        postedBy: req.user.id,
      }).populate("postedBy", "-password");
      // for (let image_id of images) {
      //   await cloudinary.uploader.destroy(image_id);
      // }

      await Comments.deleteMany({ _id: { $in: result.comments } });

      images.forEach(async (image_id) => {
        await cloudinary.uploader.destroy(image_id);
      });

      res.json({ msg: "Delete Success", post: result });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  updatePost: async (req, res) => {
    try {
      const { images, title } = req.body;
      const { id } = req.params;

      const post = await Posts.findByIdAndUpdate(
        id,
        {
          title,
          images,
        },
        { new: true }
      )
        .populate("postedBy likes", "avatar username fullname")
        .populate({
          path: "comments",
          populate: {
            path: "user likes",
            select: "-password",
          },
        });

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

      const like = await Posts.findByIdAndUpdate(
        id,
        {
          $push: { likes: req.body.id },
        },
        { new: true }
      );
      if (!like)
        return res.status(400).json({ msg: "This post doesn't exist" });
      res.json({ msg: "Liked post" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  unLikePost: async (req, res) => {
    try {
      const { id } = req.params;
      const like = await Posts.findByIdAndUpdate(
        id,
        {
          $pull: { likes: req.body.id },
        },
        { new: true }
      );
      if (!like)
        return res.status(400).json({ msg: "This post doesn't exist" });
      res.json({ msg: "UnLiked post" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  explorePost: async (req, res) => {
    try {
      const { id } = req.params;
      const { limit, page } = req.query;
      const perPage = Number(limit) || 12;
      const currentPage = page || 1;

      const posts = await Posts.find({ postedBy: { $nin: id } })
        .skip((currentPage - 1) * perPage)
        .limit(perPage)
        .populate("postedBy", "-password")
        .sort("-updatedAt");

      res.json(posts);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
};

module.exports = postController;
