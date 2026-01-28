const { Op } = require("sequelize");
const db = require("../../models");

const { User, Claim, LostItem } = db;

const safeNumber = (value) => Number(value) || 0;

exports.getAdminNotifications = async (req, res) => {
  try {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [
      pendingClaims,
      awaitingResolution,
      pendingLostItems,
      newUsers,
    ] = await Promise.all([
      Claim.count({ where: { status: "pending" } }),
      Claim.count({ where: { status: "awaiting_admin_resolution" } }),
      LostItem.count({ where: { status: "pending" } }),
      User.count({ where: { createdAt: { [Op.gte]: weekAgo } } }),
    ]);

    const items = [
      {
        id: "pending-claims",
        title: "Pending claim verifications",
        description: "Claims waiting for admin review",
        count: safeNumber(pendingClaims),
        route: "/admin/claims",
        tone: "warning",
      },
      {
        id: "awaiting-resolution",
        title: "Awaiting resolution",
        description: "Claims awaiting confirmation",
        count: safeNumber(awaitingResolution),
        route: "/admin/claims",
        tone: "info",
      },
      {
        id: "pending-lost",
        title: "Pending lost item reviews",
        description: "Lost items awaiting admin action",
        count: safeNumber(pendingLostItems),
        route: "/admin/lost-items",
        tone: "neutral",
      },
      {
        id: "new-users",
        title: "New user registrations",
        description: "Users registered in the last 7 days",
        count: safeNumber(newUsers),
        route: "/admin/users",
        tone: "success",
      },
    ];

    const badgeCount = items.reduce(
      (sum, item) => sum + safeNumber(item.count),
      0
    );

    return res.json({
      badgeCount,
      items,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("ADMIN NOTIFICATIONS ERROR:", error);
    return res.status(500).json({
      message: "Failed to load notifications",
    });
  }
};
