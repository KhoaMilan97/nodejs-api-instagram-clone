const router = require("express").Router();

const auth = require("../middlewares/auth");

const notifyController = require("../controllers/notifyController");

router.post("/create-notify", auth, notifyController.createNotify);
router.delete("/remove-notify/:id", auth, notifyController.removeNotify);
router.get("/notifies", auth, notifyController.getNotify);

module.exports = router;
