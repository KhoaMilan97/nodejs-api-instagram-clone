const Comments = require("../models/commentModel");
const Posts = require("../models/postModel");
const ObjectID = require("mongodb").ObjectID;

const commentController = {
  // getCommentPost: async (req, res) => {
  //   try {
  //     const { page, limit } = req.query;
  //     const currentPage = page || 1;
  //     const perPage = 12;
  //     const limitCmt = Number(limit) || 0;
  //     const comment = await Comments.find({ post_id: req.params.id })
  //       .skip((currentPage - 1) * perPage + limitCmt)
  //       .limit(perPage)
  //       .sort("-createdAt")
  //       .populate("user", "username avatar");

  //     res.json(comment);
  //   } catch (err) {
  //     return res.status(500).json({ msg: err.message });
  //   }
  // },

  createComment: async (req, res) => {
    try {
      const {
        user,
        content,
        post_id,
        tag,
        reply,
        userPostId,
        likes,
      } = req.body;
      let newComment = new Comments({
        user,
        content,
        post_id,
        tag,
        reply,
        likes,
        userPostId,
      });

      const post = await Posts.findById(post_id);
      if (!post)
        return res.status(400).json({ msg: "This post doesn't exist." });

      if (reply) {
        const cmt = await Comments.findById(reply);
        if (!cmt)
          return res.status(400).json({ msg: "This comment doesn't exist." });
      }

      await Posts.findOneAndUpdate(
        { _id: req.body.post_id },
        {
          $push: { comments: newComment },
        },
        { new: true }
      );

      await newComment.save();

      newComment = await newComment
        .populate("user", "username avatar")
        .execPopulate();

      res.json({ comment: newComment });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  updateComment: async (req, res) => {
    try {
      const { content } = req.body;
      const { id } = req.params;
      const cmt = await Comments.findOneAndUpdate(
        { _id: id, user: req.user.id },
        { content }
      );
      if (!cmt) return res.status(400).json({ msg: "Update failed." });

      res.json({ msg: "Update Success!" });
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
      await Comments.findOneAndUpdate(
        { _id: id },
        {
          $push: { likes: req.body.id },
        },
        { new: true }
      );

      res.json({ msg: "Like Comment!" });
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
      await Comments.findOneAndUpdate(
        { _id: id },
        {
          $pull: { likes: req.body.id },
        },
        { new: true }
      );

      res.json({ msg: "Un Like Comment!" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  deleteComment: async (req, res) => {
    try {
      const comment = await Comments.findOneAndDelete({
        _id: req.params.id,
        $or: [{ user: req.user.id }, { userPostId: req.user.id }],
      });

      if (comment) {
        await Posts.findOneAndUpdate(
          { _id: comment.post_id },
          {
            $pull: {
              comments: req.params.id,
            },
          }
        );
      }

      res.json({
        msg: "Delelete comment Success",
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
};

module.exports = commentController;
