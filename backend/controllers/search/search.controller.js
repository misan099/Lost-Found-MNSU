"use strict";

const { Op } = require("sequelize");
const db = require("../../models");

const FoundItem = db.FoundItem;
const LostItem = db.LostItem;
const User = db.User;

const buildFileUrl = (req, url) => {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  if (url.startsWith("/")) return `${baseUrl}${url}`;
  return `${baseUrl}/${url}`;
};

const buildSearchWhere = (query) => ({
  [Op.or]: [
    { item_name: { [Op.iLike]: `%${query}%` } },
    { category: { [Op.iLike]: `%${query}%` } },
    { location: { [Op.iLike]: `%${query}%` } },
    { area: { [Op.iLike]: `%${query}%` } },
    { exact_location: { [Op.iLike]: `%${query}%` } },
    { "$user.name$": { [Op.iLike]: `%${query}%` } },
    { "$user.username$": { [Op.iLike]: `%${query}%` } },
  ],
});

const buildUserWhere = (query) => ({
  [Op.or]: [
    { name: { [Op.iLike]: `%${query}%` } },
    { username: { [Op.iLike]: `%${query}%` } },
    { email: { [Op.iLike]: `%${query}%` } },
  ],
});

const mapItem = (req, item, type) => ({
  id: item.id,
  type,
  name: item.item_name || "",
  category: item.category || "",
  location: item.location || item.area || item.exact_location || "",
  status: item.status || "",
  imageUrl: buildFileUrl(
    req,
    item.image_url || item.image_path || null
  ),
  createdAt: item.created_at || null,
});

const mapUser = (user) => ({
  id: user.id,
  type: "user",
  name: user.name || user.username || "User",
  username: user.username || "",
  email: user.email || "",
  createdAt: user.createdAt || null,
});

/* ======================================================
   SEARCH ITEMS
   GET /api/search?q=
====================================================== */
exports.searchItems = async (req, res) => {
  try {
    const query = String(req.query.q || "").trim();
    if (!query || query.length < 2) {
      return res.json({ data: [] });
    }

    const limit = Math.min(
      Math.max(Number(req.query.limit) || 8, 1),
      20
    );
    const where = buildSearchWhere(query);

    const [foundItems, lostItems, users] = await Promise.all([
      FoundItem.findAll({
        where,
        include: [
          {
            model: User,
            as: "user",
            attributes: [],
            required: false,
          },
        ],
        limit,
        order: [["created_at", "DESC"]],
        attributes: [
          "id",
          "item_name",
          "category",
          "location",
          "area",
          "exact_location",
          "image_url",
          "image_path",
          "status",
          "created_at",
        ],
      }),
      LostItem.findAll({
        where,
        include: [
          {
            model: User,
            as: "user",
            attributes: [],
            required: false,
          },
        ],
        limit,
        order: [["created_at", "DESC"]],
        attributes: [
          "id",
          "item_name",
          "category",
          "location",
          "area",
          "exact_location",
          "image_url",
          "image_path",
          "status",
          "created_at",
        ],
      }),
      User.findAll({
        where: buildUserWhere(query),
        limit,
        order: [["createdAt", "DESC"]],
        attributes: ["id", "name", "username", "email", "createdAt"],
      }),
    ]);

    const results = [
      ...users.map((user) => mapUser(user)),
      ...foundItems.map((item) => mapItem(req, item, "found")),
      ...lostItems.map((item) => mapItem(req, item, "lost")),
    ].sort((a, b) => {
      const typeWeight = (value) => (value.type === "user" ? 0 : 1);
      const typeCompare = typeWeight(a) - typeWeight(b);
      if (typeCompare !== 0) return typeCompare;
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });

    return res.json({ data: results });
  } catch (error) {
    console.error("SEARCH ITEMS ERROR:", error);
    return res.status(500).json({
      message: "Failed to search items",
    });
  }
};
