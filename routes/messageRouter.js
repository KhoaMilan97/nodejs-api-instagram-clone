const router = require("express").Router();

const auth = require("../middlewares/auth");
const messageController = require("../controllers/messageController");

router.post("/message", auth, messageController.createMessage);
router.get("/convervations", auth, messageController.getConservations);
router.get("/messages/:id", auth, messageController.getMessages);
router.delete("/messages/:id", auth, messageController.deleteMessages);
router.delete("/convervations/:id", auth, messageController.deleteConservation);

module.exports = router;
