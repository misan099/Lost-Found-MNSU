const express = require("express");
const {
  getAdminDashboardStats,
} = require("../../controllers/admin-dashboard/adminDashboard.controller");
const { protect, adminOnly } = require("../../middlewares/authMiddleware");

const router = express.Router();

router.get("/", protect, adminOnly, getAdminDashboardStats);

module.exports = router;
