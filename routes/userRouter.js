const router = require("express").Router();

const auth = require("../middlewares/auth");

const userController = require("../controllers/userController");

router.get("/search", auth, userController.search);
router.get("/user-info/:username", userController.getUser);
router.put("/user/follow", auth, userController.followUser);
router.put("/user/unfollow", auth, userController.unfollowUser);

module.exports = router;
