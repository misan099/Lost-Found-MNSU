"use strict";

const LostItem = require("../models/LostItem");

/* ======================================================
   PART A — CREATE LOST ITEM (USER)
   POST /api/lost-items
   Access: Authenticated user
====================================================== */
exports.createLostItem = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      item_name,
      category,
      description,
      location,
      date_lost,
      image_url,
    } = req.body;

    // Validate required fields
    if (
      !item_name ||
      !category ||
      !description ||
      !location ||
      !date_lost
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    const lostItem = await LostItem.create({
      user_id: userId, // 🔐 from token
      item_name,
      category,
      description,
      location,
      date_lost,
      image_url: image_url || null,
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Lost item created successfully",
      data: lostItem,
    });
  } catch (error) {
    console.error("Create Lost Item Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create lost item",
    });
  }
};

/* ======================================================
   PART B — GET LOST ITEMS (PUBLIC)
   GET /api/lost-items
   Access: Public
====================================================== */
exports.getPublicLostItems = async (req, res) => {
  try {
    const lostItems = await LostItem.findAll({
      where: { status: "pending" },
      attributes: [
        "id",
        "item_name",
        "category",
        "description",
        "location",
        "date_lost",
        "image_url",
        "status",
      ],
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Lost items fetched successfully",
      data: lostItems,
    });
  } catch (error) {
    console.error("Get Public Lost Items Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch lost items",
    });
  }
};

/* ======================================================
   PART C — GET MY LOST ITEMS (USER DASHBOARD)
   GET /api/lost-items/my
   Access: Authenticated user
====================================================== */
exports.getMyLostItems = async (req, res) => {
  try {
    const userId = req.user.id;

    const myLostItems = await LostItem.findAll({
      where: { user_id: userId },
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Your lost items fetched successfully",
      data: myLostItems,
    });
  } catch (error) {
    console.error("Get My Lost Items Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch your lost items",
    });
  }
};
