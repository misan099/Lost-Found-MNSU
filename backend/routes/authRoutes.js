const express = require("express");

// Controllers
const { login, signup, getAccountStatus } = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const {
  checkEmail,
  verifySecurityAnswer,
  updateUsername,
  resetPassword,
} = require("../controllers/forgotPasswordController");

const router = express.Router();

/* =======================
   AUTH
======================= */
router.post("/login", login);
router.post("/signup", signup);
router.get("/status", protect, getAccountStatus);

/* =======================
   FORGOT PASSWORD
======================= */
router.post("/forgot-password/email", checkEmail);
router.post("/forgot-password/verify", verifySecurityAnswer);
router.post("/forgot-password/update-username", updateUsername);
router.post("/forgot-password/reset", resetPassword);

/* 🔴 THIS LINE MUST BE EXACT */
module.exports = router;
