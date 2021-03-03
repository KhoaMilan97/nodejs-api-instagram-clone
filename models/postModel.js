const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    images: {
      type: Array,
      required: true,
    },
    postedBy: {
      type: ObjectId,
      ref: "Users",
      required: true,
    },
    likes: {
      type: Array,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Posts", postSchema);