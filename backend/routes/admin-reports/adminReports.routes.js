const express = require("express");
const {
  getAdminReports,
} = require("../../controllers/admin-reports/adminReports.controller");
const { protect, adminOnly } = require("../../middlewares/authMiddleware");

const router = express.Router();

router.get("/", protect, adminOnly, getAdminReports);

module.exports = router;
