const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: ObjectId,
      ref: "Users",
    },
    content: String,
    post_id: String,
    reply: Array,
    likes: [{ type: ObjectId, ref: "Users" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comments", commentSchema);
