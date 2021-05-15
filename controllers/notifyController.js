const Notifies = require("../models/notifyModel");

const notifyController = {
  createNotify: async (req, res) => {
    try {
      const { id, user, recipients, url, text, content, image } = req.body;

      if (recipients.includes(req.user.id.toString())) return;

      const notify = new Notifies({
        id,
        user,
        recipients,
        url,
        text,
        content,
        image,
        user: req.user.id,
      });

      await notify.save();
      res.status(201).json({ notify });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  removeNotify: async (req, res) => {
    try {
      const notify = await Notifies.findOneAndDelete({
        id: req.params.id,
        url: req.query.url,
      });
      res.status(201).json({ notify });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getNotify: async (req, res) => {
    try {
      const notifies = await Notifies.find({
        recipients: req.user.id,
      })
        .sort({ createdAt: -1 })
        .populate("user", "username avatar");
      res.status(201).json({ notifies });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  isReadNotify: async (req, res) => {
    try {
      const notifies = await Notifies.findOneAndUpdate(
        {
          _id: req.params.id,
        },
        {
          isRead: true,
        }
      );

      res.status(201).json({ notifies });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  deleteAllNotifies: async (req, res) => {
    try {
      const notifies = await Notifies.deleteMany({
        recipients: req.user.id,
      });

      res.status(201).json({ notifies });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
};

module.exports = notifyController;
