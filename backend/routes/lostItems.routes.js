const express = require("express");
const router = express.Router();

const {
  createLostItem,
  getPublicLostItems,
  getMyLostItems,
} = require("../controllers/lostItems.controller");

const { protect } = require("../middlewares/authMiddleware");

/* ======================================================
   PART B — GET LOST ITEMS (PUBLIC)
====================================================== */
router.get("/", getPublicLostItems);

/* ======================================================
   GET MY LOST ITEMS (USER DASHBOARD)
====================================================== */
router.get("/my", protect, getMyLostItems);

/* ======================================================
   PACREATE LOST ITEM (USER)
====================================================== */
router.post("/", protect, createLostItem);

module.exports = router;
