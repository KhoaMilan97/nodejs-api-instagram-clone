const router = require("express").Router();

const auth = require("../middlewares/auth");

const commentController = require("../controllers/commentController");

router.get("/comment/:id", auth, commentController.getCommentHomeCard);
router.get("/comments/:id", commentController.getCommentPost);
router.get("/comment-count/:id", auth, commentController.getCommentCount);
router.post("/create-comment", auth, commentController.createComment);
router.post("/like-comment/:id", auth, commentController.likeComment);
router.post("/unlike-comment/:id", auth, commentController.unLikeComment);
router.post("/reply-comment", auth, commentController.replyComment);
router.delete("/del-comment/:id", auth, commentController.deleteComment);
router.patch("/del-reply-comment/:id", auth, commentController.deleteReplyCmt);

module.exports = router;
