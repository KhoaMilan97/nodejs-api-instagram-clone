const Users = require("../models/userModel");
const cloudinary = require("cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// upload_preset: "instagram-clone",
// if using form req.files.file.path
const uploadController = {
  changeAvatar: async (req, res) => {
    try {
      const { image, userid } = req.body;
      const result = await cloudinary.uploader.upload(image, {
        public_id: `${Date.now()}`,
        resource_type: "auto",
      });

      const newAvatar = {
        url: result.secure_url,
        public_id: result.public_id,
      };

      const user = await Users.findOneAndUpdate(
        { _id: userid },
        { avatar: newAvatar },
        {
          new: true,
        }
      );

      res.json({
        user,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ msg: err.message });
    }
  },
  removeAvatar: async (req, res) => {
    try {
      let image_id = req.body.public_id;
      let userid = req.body.userid;

      await cloudinary.uploader.destroy(image_id);

      const user = await Users.findOneAndUpdate(
        { _id: userid },
        { avatar: "" },
        {
          new: true,
        }
      );

      res.json({
        user,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ msg: err.message });
    }
  },
};

module.exports = uploadController;
