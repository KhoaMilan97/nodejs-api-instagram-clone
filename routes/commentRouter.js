const router = require("express").Router();

const auth = require("../middlewares/auth");

const commentController = require("../controllers/commentController");

router.get("/comment/:id", auth, commentController.getCommentHomeCard);
router.get("/comments/:id", commentController.getCommentPost);
router.get("/comment-count/:id", auth, commentController.getCommentCount);
router.post("/create-comment", auth, commentController.createComment);

module.exports = router;
