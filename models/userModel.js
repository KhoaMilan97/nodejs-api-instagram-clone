const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    fullname: String,
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    phoneNumber: String,
    emailVerified: {
      type: Boolean,
      default: false,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
    avatar: {
      url: { Type: String },
      public_id: { Type: String },
    },
    description: String,
    website: String,
    followers: [{ type: ObjectId, ref: "Users" }],
    following: [{ type: ObjectId, ref: "Users" }],
    saved: [
      {
        type: ObjectId,
        ref: "Posts",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Users", userSchema);
