const express = require("express");
const router = express.Router();

const {
  createClaim,
  getUserClaimsWithMessages,
  getClaimMessages,
  postClaimMessage,
  confirmOwnerReceived,
  confirmFinderReturned,
} = require("../controllers/claimController");
const { protect } = require("../middlewares/authMiddleware"); // バ. CORRECT PATH
const upload = require("../middlewares/multerConfig");

router.post("/", protect, upload.single("proof_image"), createClaim);
router.get("/with-messages", protect, getUserClaimsWithMessages);
router.get("/:claimId/messages", protect, getClaimMessages);
router.post("/:claimId/messages", protect, postClaimMessage);
router.patch("/:claimId/confirm-owner", protect, confirmOwnerReceived);
router.patch("/:claimId/confirm-finder", protect, confirmFinderReturned);

module.exports = router;
