const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: ObjectId,
      ref: "Users",
    },
    content: String,
    post_id: ObjectId,
    reply: ObjectId,
    tag: Object,
    likes: [{ type: ObjectId, ref: "Users" }],
    userPostId:  ObjectId,
    
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comments", commentSchema);
