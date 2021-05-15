const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const messageSchema = new mongoose.Schema(
  {
    conversation: { type: ObjectId, ref: "Conversations" },
    sender: { type: mongoose.Types.ObjectId, ref: "Users" },
    recipient: { type: ObjectId, ref: "Users" },
    text: String,
    media: Array,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Messages", messageSchema);
