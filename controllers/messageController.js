const Conversations = require("../models/conversationModel");
const Messages = require("../models/messageModel");
const cloudinary = require("cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

class APIfeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  paginating() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 9;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

const messageController = {
  createMessage: async (req, res) => {
    try {
      const { sender, recipient, text, media, call } = req.body;

      if (!recipient || (!text.trim() && media.length === 0 && !call)) return;

      const newConversation = await Conversations.findOneAndUpdate(
        {
          $or: [
            { recipients: [sender, recipient] },
            { recipients: [recipient, sender] },
          ],
        },
        {
          recipients: [sender, recipient],
          text,
          media,
          call,
        },
        { new: true, upsert: true }
      );

      const newMessage = new Messages({
        conversation: newConversation,
        sender,
        recipient,
        text,
        media,
        call,
      });

      await newMessage.save();

      res.json({ newConversation, newMessage });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getConservations: async (req, res) => {
    try {
      const features = new APIfeatures(
        Conversations.find({
          recipients: req.user.id,
        }),
        req.query
      ).paginating();

      const conservations = await features.query
        .sort("-updatedAt")
        .populate("recipients", "username avatar fullname");

      res.json({ conservations, result: conservations.length });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getMessages: async (req, res) => {
    try {
      const features = new APIfeatures(
        Messages.find({
          $or: [
            { sender: req.user.id, recipient: req.params.id },
            { sender: req.params.id, recipient: req.user.id },
          ],
        }),
        req.query
      ).paginating();

      const messages = await features.query.sort("-createdAt");

      res.json({ messages, result: messages.length });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  deleteMessages: async (req, res) => {
    try {
      const message = await Messages.findOne({
        _id: req.params.id,
        sender: req.user.id,
      });

      if (message.media.length > 0) {
        message.media.forEach(async (item) => {
          await cloudinary.uploader.destroy(item.public_id);
        });
      }

      await Messages.findOneAndDelete({
        _id: req.params.id,
        sender: req.user.id,
      });

      res.json({ msg: "Delete Success!" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  deleteConservation: async (req, res) => {
    try {
      const newConve = await Conversations.findOneAndDelete({
        $or: [
          { recipients: [req.user.id, req.params.id] },
          { recipients: [req.params.id, req.user.id] },
        ],
      });
      await Messages.deleteMany({ conversation: newConve._id });

      res.json({ msg: "Delete Success!" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
};

module.exports = messageController;
