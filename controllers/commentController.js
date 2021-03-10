const Comments = require("../models/commentModel");

const commentController = {
  getCommentHomeCard: async (req, res) => {
    try {
      const comment = await Comments.find({ post_id: req.params.id })
        .sort("-createdAt")
        .limit(2);

      res.json(comment);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getCommentPost: async (req, res) => {
    try {
      const { page } = req.query;
      const currentPage = page || 1;
      const perPage = 12;
      const comment = await Comments.find({ post_id: req.params.id })
        .skip((currentPage - 1) * perPage)
        .limit(perPage);

      res.json(comment);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getCommentCount: async (req, res) => {
    let totalCount = await Comments.find({ post_id: req.params.id })
      .countDocuments()
      .exec();
    if (totalCount > 2) {
      totalCount = totalCount - 2;
    } else {
      totalCount = 0;
    }

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
};

module.exports = commentController;
