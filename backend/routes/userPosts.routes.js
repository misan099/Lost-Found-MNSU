const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/authMiddleware");
const userPostsController = require("../controllers/userPosts.controller");

router.get("/lost", protect, userPostsController.getMyLostItems);
router.get("/found", protect, userPostsController.getMyFoundItems);

router.patch("/lost/:id", protect, userPostsController.updateMyLostItem);
router.patch("/found/:id", protect, userPostsController.updateMyFoundItem);

router.delete("/lost/:id", protect, userPostsController.deleteMyLostItem);
router.delete("/found/:id", protect, userPostsController.deleteMyFoundItem);

module.exports = router;
