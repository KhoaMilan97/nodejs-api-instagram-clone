const Comments = require("../models/commentModel");

const commentController = {
  getCommentHomeCard: async (req, res) => {
    try {
      const comment = await Comments.find({ post_id: req.params.id })
        .sort("-createdAt")
        .limit(2)
        .populate("user", "username avatar");

      res.json(comment);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getCommentPost: async (req, res) => {
    try {
      const { page, limit } = req.query;
      const currentPage = page || 1;
      const perPage = Number(limit) || 12;
      const comment = await Comments.find({ post_id: req.params.id })
        .skip((currentPage - 1) * perPage)
        .limit(perPage)
        .sort("-createdAt")
        .populate("user", "username avatar");

      res.json(comment);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getCommentCount: async (req, res) => {
    let totalCount = await Comments.find({ post_id: req.params.id })
      .countDocuments()
      .exec();

    res.json(totalCount);
  },
  createComment: async (req, res) => {
    try {
      const comment = await new Comments(req.body).save();

      res.json(comment);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  likeComment: async (req, res) => {
    try {
      const { id } = req.params;
      const isLiked = await Comments.findOne({ _id: id, likes: req.body.id });
      if (isLiked)
        return res.status(400).json({ msg: "You already like this comment." });
      const comment = await Comments.findOneAndUpdate(
        { _id: id },
        {
          $push: { likes: req.body.id },
        },
        { new: true }
      );

      res.json(comment);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  unLikeComment: async (req, res) => {
    try {
      const { id } = req.params;
      // const isLiked = await Comments.findOne({ _id: req.body.id, user: id });
      // if (isLiked)
      //   return res.status(400).json({ msg: "You already like this comment." });
      const comment = await Comments.findOneAndUpdate(
        { _id: id },
        {
          $pull: { likes: req.body.id },
        },
        { new: true }
      );

      res.json(comment);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  replyComment: async (req, res) => {
    try {
      // comment_id, user_rep_id, user_comment_id, content
      const { comment_id, username_comment, user_rep_id, content } = req.body;
      const comment = await Comments.findOneAndUpdate(
        {
          _id: comment_id,
        },
        {
          $push: { reply: { username_comment, content, user_rep_id } },
        }
      );
      res.json(comment);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
};

module.exports = commentController;
