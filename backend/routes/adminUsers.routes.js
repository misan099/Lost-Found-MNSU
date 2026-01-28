const express = require("express");
const {
  getAdminUsers,
  suspendUser,
  blockUser,
  activateUser,
} = require("../controllers/adminUsers.controller");
const { protect, adminOnly } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", protect, adminOnly, getAdminUsers);
router.patch("/:userId/suspend", protect, adminOnly, suspendUser);
router.patch("/:userId/block", protect, adminOnly, blockUser);
router.patch("/:userId/activate", protect, adminOnly, activateUser);

module.exports = router;
