const express = require("express");
const router = express.Router();

const {
  getAdminClaimsWithMessages,
  getAdminClaimMessages,
  verifyClaim,
  resolveClaim,
  rejectClaim,
} = require("../controllers/claimController");
const {
  protect,
  adminOnly,
} = require("../middlewares/authMiddleware");

router.get("/with-messages", protect, adminOnly, getAdminClaimsWithMessages);
router.get("/:claimId/messages", protect, adminOnly, getAdminClaimMessages);
router.patch("/:claimId/verify", protect, adminOnly, verifyClaim);
router.post("/:claimId/resolve", protect, adminOnly, resolveClaim);
router.patch("/:claimId/reject", protect, adminOnly, rejectClaim);

module.exports = router;
