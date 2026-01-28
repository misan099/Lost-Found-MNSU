const express = require("express");
const {
  getAdminNotifications,
} = require("../../controllers/admin-notifications/adminNotifications.controller");
const { protect, adminOnly } = require("../../middlewares/authMiddleware");

const router = express.Router();

router.get("/", protect, adminOnly, getAdminNotifications);

module.exports = router;
