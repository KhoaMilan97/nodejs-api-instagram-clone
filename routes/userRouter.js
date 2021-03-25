const router = require("express").Router();

const auth = require("../middlewares/auth");

const userController = require("../controllers/userController");

router.get("/search", auth, userController.search);
router.get("/user-info/:username", userController.getUser);
router.put("/user/follow", auth, userController.followUser);
router.put("/user/unfollow", auth, userController.unfollowUser);
router.patch("/update-user/:id", auth, userController.updateUser);
router.patch("/saved/:id", auth, userController.savedPost);
router.patch("/un-saved/:id", auth, userController.unsavedPost);
router.get("/suggest-user/:id", auth, userController.suggestUser);

module.exports = router;
