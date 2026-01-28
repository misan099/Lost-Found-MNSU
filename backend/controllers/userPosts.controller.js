"use strict";

const { Op } = require("sequelize");
const db = require("../models");

const LostItem = db.LostItem;
const FoundItem = db.FoundItem;
const Claim = db.Claim;

const VERIFIED_CLAIM_STATUSES = [
  "verified",
  "approved",
  "awaiting_admin_resolution",
  "resolved",
];

const appendVerifiedClaimFlag = async (items, claimKey) => {
  const itemIds = items.map((item) => item.id).filter(Boolean);
  if (!itemIds.length) return;

  const verifiedClaims = await Claim.findAll({
    attributes: [claimKey],
    where: {
      [claimKey]: { [Op.in]: itemIds },
      status: { [Op.in]: VERIFIED_CLAIM_STATUSES },
    },
    group: [claimKey],
    raw: true,
  });

  const verifiedSet = new Set(verifiedClaims.map((row) => row[claimKey]));
  items.forEach((item) => {
    item.setDataValue("hasVerifiedClaim", verifiedSet.has(item.id));
  });
};

const normalizeText = (value) =>
  typeof value === "string" ? value.trim() : "";

const parseDate = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
};

/* ======================================================
   GET MY LOST ITEMS
   GET /api/user-posts/lost
   Access: Authenticated user
====================================================== */
exports.getMyLostItems = async (req, res) => {
  try {
    const userId = req.user.id;
    const items = await LostItem.findAll({
      where: { user_id: userId },
      order: [["created_at", "DESC"]],
    });

    await appendVerifiedClaimFlag(items, "lost_item_id");

    return res.status(200).json({
      success: true,
      message: "Your lost items fetched successfully",
      data: items,
    });
  } catch (error) {
    console.error("Get My Lost Items Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch your lost items",
    });
  }
};

/* ======================================================
   GET MY FOUND ITEMS
   GET /api/user-posts/found
   Access: Authenticated user
====================================================== */
exports.getMyFoundItems = async (req, res) => {
  try {
    const userId = req.user.id;
    const items = await FoundItem.findAll({
      where: { user_id: userId },
      order: [["created_at", "DESC"]],
    });

    await appendVerifiedClaimFlag(items, "found_item_id");

    return res.status(200).json({
      success: true,
      message: "Your found items fetched successfully",
      data: items,
    });
  } catch (error) {
    console.error("Get My Found Items Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch your found items",
    });
  }
};

/* ======================================================
   UPDATE MY LOST ITEM
   PATCH /api/user-posts/lost/:id
   Access: Authenticated user
====================================================== */
exports.updateMyLostItem = async (req, res) => {
  try {
    const itemId = Number(req.params.id);
    if (!itemId) {
      return res.status(400).json({ message: "Invalid item id" });
    }

    const item = await LostItem.findByPk(itemId);
    if (!item) {
      return res.status(404).json({ message: "Lost item not found" });
    }
    if (item.user_id !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const updates = {};
    const itemName = normalizeText(req.body.item_name);
    const category = normalizeText(req.body.category);
    const area = normalizeText(req.body.area);
    const exactLocation = normalizeText(req.body.exact_location);
    const location = normalizeText(req.body.location);
    const description = normalizeText(
      req.body.public_description || req.body.description
    );
    const dateLost = parseDate(req.body.date_lost);

    if (itemName) updates.item_name = itemName;
    if (category) updates.category = category;
    if (area) updates.area = area;
    if (exactLocation) updates.exact_location = exactLocation;
    if (location) {
      updates.location = location;
      updates.exact_location = location;
      if (!updates.area) {
        updates.area = location;
      }
    }
    if (description) {
      updates.public_description = description;
      updates.description = description;
    }
    if (dateLost) updates.date_lost = dateLost;

    if (!Object.keys(updates).length) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    await item.update(updates);

    return res.json({
      success: true,
      message: "Lost item updated successfully",
      data: item,
    });
  } catch (error) {
    console.error("Update My Lost Item Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update lost item",
    });
  }
};

/* ======================================================
   UPDATE MY FOUND ITEM
   PATCH /api/user-posts/found/:id
   Access: Authenticated user
====================================================== */
exports.updateMyFoundItem = async (req, res) => {
  try {
    const itemId = Number(req.params.id);
    if (!itemId) {
      return res.status(400).json({ message: "Invalid item id" });
    }

    const item = await FoundItem.findByPk(itemId);
    if (!item) {
      return res.status(404).json({ message: "Found item not found" });
    }
    if (item.user_id !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const updates = {};
    const itemName = normalizeText(req.body.item_name);
    const category = normalizeText(req.body.category);
    const area = normalizeText(req.body.area);
    const exactLocation = normalizeText(req.body.exact_location);
    const location = normalizeText(req.body.location);
    const description = normalizeText(
      req.body.public_description || req.body.description
    );
    const dateFound = parseDate(req.body.date_found);

    if (itemName) updates.item_name = itemName;
    if (category) updates.category = category;
    if (area) updates.area = area;
    if (exactLocation) updates.exact_location = exactLocation;
    if (location) {
      updates.location = location;
      updates.exact_location = location;
      if (!updates.area) {
        updates.area = location;
      }
    }
    if (description) {
      updates.public_description = description;
      updates.description = description;
    }
    if (dateFound) updates.date_found = dateFound;

    if (!Object.keys(updates).length) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    await item.update(updates);

    return res.json({
      success: true,
      message: "Found item updated successfully",
      data: item,
    });
  } catch (error) {
    console.error("Update My Found Item Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update found item",
    });
  }
};

/* ======================================================
   DELETE MY LOST ITEM
   DELETE /api/user-posts/lost/:id
   Access: Authenticated user
====================================================== */
exports.deleteMyLostItem = async (req, res) => {
  try {
    const itemId = Number(req.params.id);
    if (!itemId) {
      return res.status(400).json({ message: "Invalid item id" });
    }

    const item = await LostItem.findByPk(itemId);
    if (!item) {
      return res.status(404).json({ message: "Lost item not found" });
    }
    if (item.user_id !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    await item.destroy();

    return res.json({
      success: true,
      message: "Lost item deleted successfully",
    });
  } catch (error) {
    console.error("Delete My Lost Item Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete lost item",
    });
  }
};

/* ======================================================
   DELETE MY FOUND ITEM
   DELETE /api/user-posts/found/:id
   Access: Authenticated user
====================================================== */
exports.deleteMyFoundItem = async (req, res) => {
  try {
    const itemId = Number(req.params.id);
    if (!itemId) {
      return res.status(400).json({ message: "Invalid item id" });
    }

    const item = await FoundItem.findByPk(itemId);
    if (!item) {
      return res.status(404).json({ message: "Found item not found" });
    }
    if (item.user_id !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    await item.destroy();

    return res.json({
      success: true,
      message: "Found item deleted successfully",
    });
  } catch (error) {
    console.error("Delete My Found Item Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete found item",
    });
  }
};
