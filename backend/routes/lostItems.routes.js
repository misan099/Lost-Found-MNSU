const express = require("express");
const router = express.Router();

const {
  createLostItem,
  getPublicLostItems,
  getMyLostItems,
  updateLostItem,
  deleteLostItem,
} = require("../controllers/lostItems.controller");

const { protect, adminOnly } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/multerLostItems");

/* ======================================================
   PART B — GET LOST ITEMS (PUBLIC)
====================================================== */
router.get("/", getPublicLostItems);

/* ======================================================
   GET MY LOST ITEMS (USER DASHBOARD)
====================================================== */
router.get("/my", protect, getMyLostItems);

/* ======================================================
   ADMIN: UPDATE OR DELETE LOST ITEMS
====================================================== */
router.patch("/:id", protect, adminOnly, updateLostItem);
router.delete("/:id", protect, adminOnly, deleteLostItem);

/* ======================================================
   PACREATE LOST ITEM (USER)
====================================================== */
router.post("/", protect, upload.single("image"), createLostItem);

module.exports = router;
