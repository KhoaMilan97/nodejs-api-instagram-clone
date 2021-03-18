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
      const perPage = 12;
      const limitCmt = Number(limit) || 0;
      const comment = await Comments.find({ post_id: req.params.id })
        .skip((currentPage - 1) * perPage + limitCmt)
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
      let comment = await new Comments(req.body).save();
      comment = await comment
        .populate("user", "username avatar")
        .execPopulate();

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
      ).populate("user", "username avatar");

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
      ).populate("user", "username avatar");

      res.json(comment);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  replyComment: async (req, res) => {
    try {
      // comment_id, user_rep_id, user_comment_id, content
      const {
        comment_id,
        username_comment,
        user_rep_id,
        user_rep_name,
        user_rep_avatar,
        content,
      } = req.body;
      const comment = await Comments.findOneAndUpdate(
        {
          _id: comment_id,
        },
        {
          $push: {
            reply: {
              username_comment,
              content,
              user_rep_id,
              user_rep_name,
              user_rep_avatar,
              createdAt: new Date(),
            },
          },
        },
        { new: true }
      );
      res.json(comment);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  deleteComment: async (req, res) => {
    const { id } = req.params;
    await Comments.findByIdAndDelete(id);

    res.json({ msg: "Delelete comment Success" });
  },
};

module.exports = commentController;
