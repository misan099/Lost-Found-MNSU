const express = require("express");
const router = express.Router();
const foundItemsController = require("../controllers/foundItems.controller");
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/multerConfig");

// POST route to add a found item (protected)
router.post(
  "/",
  protect,
  upload.single("image"),
  foundItemsController.addFoundItem
);

// GET route to fetch all found items (public)
router.get("/", foundItemsController.getFoundItems);

// Admin: update or delete found items
router.patch(
  "/:id",
  protect,
  adminOnly,
  foundItemsController.updateFoundItem
);
router.delete(
  "/:id",
  protect,
  adminOnly,
  foundItemsController.deleteFoundItem
);

// GET route to fetch recent found items (public)
router.get("/recent", foundItemsController.getRecentFoundItems);

module.exports = router;
