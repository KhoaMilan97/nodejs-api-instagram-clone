const router = require("express").Router();
const auth = require("../middlewares/auth");

const uploadController = require("../controllers/uploadController");

router.post("/uploadavatars", auth, uploadController.changeAvatar);
router.post("/removeavatars", auth, uploadController.removeAvatar);
router.post("/upload", auth, uploadController.uploadImages);
router.post("/remove", auth, uploadController.removeImages);

module.exports = router;
