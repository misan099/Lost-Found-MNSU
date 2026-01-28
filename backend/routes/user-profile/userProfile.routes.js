const express = require("express");
const {
  getProfile,
  updateProfile,
} = require("../../controllers/user-profile/userProfile.controller");
const { protect } = require("../../middlewares/authMiddleware");

const router = express.Router();

router.get("/me", protect, getProfile);
router.patch("/me", protect, updateProfile);

module.exports = router;
