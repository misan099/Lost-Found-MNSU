const express = require("express");
const router = express.Router();

const { protect } = require("../../middlewares/authMiddleware");
const {
  getUserResolvedItems,
} = require("../../controllers/user-resolved-items/userResolvedItems.controller");

router.get("/", protect, getUserResolvedItems);

module.exports = router;
