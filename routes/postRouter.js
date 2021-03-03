const router = require("express").Router();

const auth = require("../middlewares/auth");

const postController = require("../controllers/postController");

router.post("/create-post", auth, postController.createPost);
router.get("/posts/:userid", auth, postController.getPost);
router.get("/post/:id", auth, postController.getSinglePost);
router.get("/follower-post/:id", auth, postController.followPost);
router.delete("/post/:id", auth, postController.removePost);
router.patch("/post/:id", auth, postController.updatePost);

module.exports = router;
