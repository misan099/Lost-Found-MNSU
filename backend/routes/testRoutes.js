const express = require("express");
const { protect, adminOnly } = require("../middlewares/authMiddleware");

const router = express.Router();
// 👇 ADD THESE DEBUG LINES
console.log("testRoutes loaded");
console.log("protect:", typeof protect);
console.log("adminOnly:", typeof adminOnly);

// 🔒 Any logged-in user
router.get("/profile", protect, (req, res) => {
  res.json({
    message: "User profile accessed",
    user: req.user,
  });
});

// 🔒 Admin only
router.get("/admin", protect, adminOnly, (req, res) => {
  res.json({
    message: "Admin route accessed",
    user: req.user,
  });
});

module.exports = router;
