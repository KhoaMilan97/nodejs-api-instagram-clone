const Posts = require("../models/postModel");
const Users = require("../models/userModel");

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
      const post = await Posts.find({ postedBy: userid }).select("_id images");

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
      const query = await Users.findById(id).select("following");
      const followers = query["following"];
      let posts = [];
      for (let x of followers) {
        const post = await Posts.find({ postedBy: x })
          .populate("postedBy")
          .sort("-createdAt");
        posts.push(...post);
      }
      res.json(posts);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
};

module.exports = postController;
