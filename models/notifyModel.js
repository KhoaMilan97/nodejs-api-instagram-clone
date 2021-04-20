const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const notifySchema = new mongoose.Schema(
  {
    id: ObjectId,
    user: { type: ObjectId, ref: "Users" },
    recipients: [ObjectId],
    url: String,
    text: String,
    content: String,
    image: String,
    isRead: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Notifies", notifySchema);
