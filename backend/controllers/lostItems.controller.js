"use strict";

const { z } = require("zod");
const db = require("../models");

const LostItem = db.LostItem;
const User = db.User;

const lostItemSchema = z.object({
  item_name: z.string().trim().min(2, "Item name must be at least 2 characters"),
  category: z.string().trim().min(1, "Please select a category"),
  area: z.string().trim().min(1, "Area is required"),
  exact_location: z.string().trim().min(1, "Exact location is required"),
  date_lost: z
    .string()
    .min(1, "Date lost is required")
    .refine((val) => !isNaN(Date.parse(val)), "Invalid date format"),
  public_description: z
    .string()
    .trim()
    .min(10, "Public description must be at least 10 characters"),
  admin_verification_details: z
    .string()
    .trim()
    .min(20, "Admin verification details must be at least 20 characters"),
  hidden_marks: z.string().optional().or(z.literal("")),
  verification_notes: z.string().optional().or(z.literal("")),
});

/* ======================================================
   PART A - CREATE LOST ITEM (USER)
   POST /api/lost-items
   Access: Authenticated user
====================================================== */
exports.createLostItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const payload = {
      ...req.body,
      public_description: req.body.public_description || req.body.description,
      exact_location: req.body.exact_location || req.body.location,
    };

    const validatedData = lostItemSchema.parse(payload);
    const imagePath = req.file
      ? `/uploads/lost-items/${req.file.filename}`
      : null;
    const imageUrl = imagePath || req.body.image_url || null;

    const lostItem = await LostItem.create({
      user_id: userId,
      item_name: validatedData.item_name,
      category: validatedData.category,
      area: validatedData.area,
      exact_location: validatedData.exact_location,
      location: validatedData.exact_location,
      date_lost: new Date(validatedData.date_lost),
      public_description: validatedData.public_description,
      description: validatedData.public_description,
      image_path: imagePath,
      image_url: imageUrl,
      admin_verification_details: validatedData.admin_verification_details,
      hidden_marks: validatedData.hidden_marks || null,
      verification_notes: validatedData.verification_notes || null,
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Lost item created successfully",
      data: lostItem,
    });
  } catch (error) {
    console.error("Create Lost Item Error:", error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create lost item",
    });
  }
};

/* ======================================================
   PART B - GET LOST ITEMS (PUBLIC)
   GET /api/lost-items
   Access: Public
====================================================== */
exports.getPublicLostItems = async (req, res) => {
  try {
    const lostItems = await LostItem.findAll({
      attributes: [
        "id",
        "user_id",
        "item_name",
        "category",
        "area",
        "exact_location",
        "public_description",
        "description",
        "location",
        "date_lost",
        "image_url",
        "image_path",
        "status",
      ],
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "username"],
        },
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
   ADMIN: UPDATE LOST ITEM
   PATCH /api/lost-items/:id
   Access: Admin
====================================================== */
exports.updateLostItem = async (req, res) => {
  try {
    const itemId = Number(req.params.id);
    if (!itemId) {
      return res.status(400).json({ message: "Invalid item id" });
    }

    const item = await LostItem.findByPk(itemId);
    if (!item) {
      return res.status(404).json({ message: "Lost item not found" });
    }

    const updates = {};
    const {
      item_name,
      category,
      location,
      area,
      exact_location,
      date_lost,
      public_description,
    } = req.body || {};

    if (item_name) updates.item_name = item_name.trim();
    if (category) updates.category = category.trim();
    if (location) {
      const trimmed = location.trim();
      updates.location = trimmed;
      updates.exact_location = trimmed;
    }
    if (area) updates.area = area.trim();
    if (exact_location) updates.exact_location = exact_location.trim();
    if (public_description) {
      const trimmed = public_description.trim();
      updates.public_description = trimmed;
      updates.description = trimmed;
    }
    if (date_lost) {
      const parsed = new Date(date_lost);
      if (!Number.isNaN(parsed.getTime())) {
        updates.date_lost = parsed;
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    await item.update(updates);

    return res.json({
      message: "Lost item updated successfully",
      lostItem: item,
    });
  } catch (error) {
    console.error("Error updating lost item:", error);
    return res.status(500).json({
      message: "Error updating lost item",
    });
  }
};

/* ======================================================
   ADMIN: DELETE LOST ITEM
   DELETE /api/lost-items/:id
   Access: Admin
====================================================== */
exports.deleteLostItem = async (req, res) => {
  try {
    const itemId = Number(req.params.id);
    if (!itemId) {
      return res.status(400).json({ message: "Invalid item id" });
    }

    const item = await LostItem.findByPk(itemId);
    if (!item) {
      return res.status(404).json({ message: "Lost item not found" });
    }

    await item.destroy();
    return res.json({ message: "Lost item deleted successfully" });
  } catch (error) {
    console.error("Error deleting lost item:", error);
    return res.status(500).json({
      message: "Error deleting lost item",
    });
  }
};

/* ======================================================
   PART C - GET MY LOST ITEMS (USER DASHBOARD)
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
