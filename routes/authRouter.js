const router = require("express").Router();

const auth = require("../middlewares/auth");

const authController = require("../controllers/authController");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh-token", authController.generateAccessToken);
router.get("/logout", authController.logout);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", auth, authController.resetPassword);
router.post("/check-old-password", authController.checkPassword);
router.post("/update-user", authController.updateUser);

module.exports = router;
