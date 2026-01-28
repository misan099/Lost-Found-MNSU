const db = require("../models");
const { Op } = require("sequelize");
const { z } = require("zod");
const { getAccountNotice } = require("../utils/userStatus");

const FoundItem = db.FoundItem;
const User = db.User;
const Claim = db.Claim;

const VERIFIED_CLAIM_STATUSES = [
  "verified",
  "approved",
  "awaiting_admin_resolution",
  "resolved",
];

const appendVerifiedClaimFlag = async (items) => {
  const itemIds = items.map((item) => item.id).filter(Boolean);
  if (!itemIds.length) return;

  const verifiedClaims = await Claim.findAll({
    attributes: ["found_item_id"],
    where: {
      found_item_id: { [Op.in]: itemIds },
      status: { [Op.in]: VERIFIED_CLAIM_STATUSES },
    },
    group: ["found_item_id"],
    raw: true,
  });

  const verifiedSet = new Set(
    verifiedClaims.map((row) => row.found_item_id)
  );

  items.forEach((item) => {
    item.setDataValue(
      "hasVerifiedClaim",
      verifiedSet.has(item.id)
    );
  });
};

// Zod schema for validation
const foundItemSchema = z.object({
  item_name: z.string().trim().min(2, "Item name must be at least 2 characters"),
  category: z.string().trim().min(1, "Please select a category"),
  area: z.string().trim().min(1, "Area is required"),
  exact_location: z.string().trim().min(1, "Exact location is required"),
  date_found: z
    .string()
    .min(1, "Date found is required")
    .refine((val) => !isNaN(Date.parse(val)), "Invalid date format"),
  time_found: z
    .string()
    .trim()
    .min(1, "Time found is required")
    .regex(/^\d{2}:\d{2}$/, "Invalid time format"),
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

const buildDateTime = (dateValue, timeValue) => {
  if (!dateValue) return null;
  const normalizedDate = String(dateValue).trim();
  if (!normalizedDate) return null;
  const normalizedTime = String(timeValue || "").trim();
  const hasExplicitTime = Boolean(normalizedTime);
  const hasTime = /(?:T|\s)\d{2}:\d{2}/.test(normalizedDate);

  const parsed = hasTime
    ? new Date(normalizedDate)
    : hasExplicitTime
      ? new Date(`${normalizedDate}T${normalizedTime}`)
      : new Date(normalizedDate);

  if (Number.isNaN(parsed.getTime())) return null;
  if (hasExplicitTime) {
    parsed.setSeconds(1, 0);
  }
  return parsed;
};

// Controller to add a found item
const addFoundItem = async (req, res) => {
  try {
    const accountNotice = getAccountNotice(req.user);
    if (accountNotice?.status === "suspended") {
      return res.status(403).json({
        message: accountNotice.message,
        status: accountNotice.status,
        note: accountNotice.note,
        suspendedUntil: accountNotice.suspendedUntil,
      });
    }

    // Validate incoming data
    const validatedData = foundItemSchema.parse(req.body);

    // Get image path if uploaded
    const imagePath = req.file
      ? `/uploads/found-items/${req.file.filename}`
      : null;

    // Create found item in database
    const dateFound = buildDateTime(
      validatedData.date_found,
      validatedData.time_found
    );
    if (!dateFound) {
      return res.status(400).json({
        message: "Invalid date/time format",
      });
    }

    const foundItem = await FoundItem.create({
      user_id: req.user.id,
      item_name: validatedData.item_name,
      category: validatedData.category,
      area: validatedData.area,
      exact_location: validatedData.exact_location,
      location: validatedData.exact_location,
      date_found: dateFound,
      public_description: validatedData.public_description,
      image_path: imagePath,
      image_url: imagePath,
      admin_verification_details: validatedData.admin_verification_details,
      hidden_marks: validatedData.hidden_marks || null,
      verification_notes: validatedData.verification_notes || null,
      status: "available",
    });

    return res.status(201).json({
      message: "Found item reported successfully",
      foundItem,
    });
  } catch (error) {
    console.error("Error creating found item:", error);

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors,
      });
    }

    // Handle other errors
    return res.status(500).json({
      message: "Error reporting found item",
      error: error.message,
    });
  }
};

// Controller to get all found items
const getFoundItems = async (req, res) => {
  try {
    const items = await FoundItem.findAll({
      order: [["created_at", "DESC"]],
      attributes: [
        "id",
        "user_id",
        "item_name",
        "category",
        "area",
        "exact_location",
        "date_found",
        "public_description",
        "image_path",
        "image_url",
        "status",
        "created_at",
      ],
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "username"],
        },
      ],
    });

    await appendVerifiedClaimFlag(items);

    return res.status(200).json(items);
  } catch (error) {
    console.error("Error fetching found items:", error);
    return res.status(500).json({
      message: "Error fetching found items",
      error: error.message,
    });
  }
};

// Controller to get recent found items
const getRecentFoundItems = async (req, res) => {
  try {
    const recentItems = await FoundItem.findAll({
      order: [["created_at", "DESC"]],
      limit: 3,
      attributes: [
        "id",
        "user_id",
        "item_name",
        "category",
        "area",
        "exact_location",
        "date_found",
        "public_description",
        "image_path",
        "image_url",
        "status",
        "created_at",
      ],
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "username"],
        },
      ],
    });

    await appendVerifiedClaimFlag(recentItems);

    return res.status(200).json(recentItems);
  } catch (error) {
    console.error("Error fetching recent found items:", error);
    return res.status(500).json({
      message: "Error fetching recent found items",
      error: error.message,
    });
  }
};

const updateFoundItem = async (req, res) => {
  try {
    const itemId = Number(req.params.id);
    if (!itemId) {
      return res.status(400).json({ message: "Invalid item id" });
    }

    const item = await FoundItem.findByPk(itemId);
    if (!item) {
      return res.status(404).json({ message: "Found item not found" });
    }

    const updates = {};
    const {
      item_name,
      category,
      location,
      area,
      exact_location,
      date_found,
      public_description,
    } = req.body || {};

    if (item_name) updates.item_name = item_name.trim();
    if (category) updates.category = category.trim();
    if (location) updates.location = location.trim();
    if (area) updates.area = area.trim();
    if (exact_location) updates.exact_location = exact_location.trim();
    if (public_description) {
      updates.public_description = public_description.trim();
    }
    if (date_found) {
      const parsed = new Date(date_found);
      if (!Number.isNaN(parsed.getTime())) {
        updates.date_found = parsed;
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    await item.update(updates);

    return res.json({
      message: "Found item updated successfully",
      foundItem: item,
    });
  } catch (error) {
    console.error("Error updating found item:", error);
    return res.status(500).json({
      message: "Error updating found item",
    });
  }
};

const deleteFoundItem = async (req, res) => {
  try {
    const itemId = Number(req.params.id);
    if (!itemId) {
      return res.status(400).json({ message: "Invalid item id" });
    }

    const item = await FoundItem.findByPk(itemId);
    if (!item) {
      return res.status(404).json({ message: "Found item not found" });
    }

    await item.destroy();
    return res.json({ message: "Found item deleted successfully" });
  } catch (error) {
    console.error("Error deleting found item:", error);
    return res.status(500).json({
      message: "Error deleting found item",
    });
  }
};

module.exports = {
  addFoundItem,
  getFoundItems,
  getRecentFoundItems,
  updateFoundItem,
  deleteFoundItem,
};
