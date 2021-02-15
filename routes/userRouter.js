const router = require("express").Router();

const auth = require("../middlewares/auth");

const userController = require("../controllers/userController");

router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/refresh-token", userController.generateAccessToken);
router.get("/logout", userController.logout);
router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password", auth, userController.resetPassword);
router.post("/check-old-password", userController.checkPassword);

module.exports = router;
