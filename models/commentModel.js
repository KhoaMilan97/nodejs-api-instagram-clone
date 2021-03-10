const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const commentSchema = new mongoose.Schema(
  {
    username: String,
    content: String,
    post_id: String,
    replay: Array,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comments", commentSchema);
