const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const conversationSchema = new mongoose.Schema(
  {
    recipients: [{ type: ObjectId, ref: "Users" }],
    text: String,
    media: Array,
    call: Object,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Conversations", conversationSchema);
