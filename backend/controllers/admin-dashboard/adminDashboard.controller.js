const db = require("../../models");
const { Op } = require("sequelize");

const { User, LostItem, FoundItem, Claim } = db;

const safeNumber = (value) => Number(value) || 0;

exports.getAdminDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalLost,
      totalFound,
      resolvedLost,
      resolvedFound,
      activeClaims,
      pendingClaims,
      awaitingResolution,
    ] = await Promise.all([
      User.count(),
      LostItem.count(),
      FoundItem.count(),
      LostItem.count({ where: { status: "resolved" } }),
      FoundItem.count({ where: { status: "resolved" } }),
      Claim.count({
        where: {
          status: {
            [Op.in]: [
              "pending",
              "verified",
              "awaiting_admin_resolution",
            ],
          },
        },
      }),
      Claim.count({ where: { status: "pending" } }),
      Claim.count({ where: { status: "awaiting_admin_resolution" } }),
    ]);

    const totalResolved = safeNumber(resolvedLost) + safeNumber(resolvedFound);

    return res.json({
      totals: {
        users: safeNumber(totalUsers),
        lost: safeNumber(totalLost),
        found: safeNumber(totalFound),
        resolved: totalResolved,
      },
      claims: {
        active: safeNumber(activeClaims),
        pending: safeNumber(pendingClaims),
        awaitingResolution: safeNumber(awaitingResolution),
      },
    });
  } catch (error) {
    console.error("ADMIN DASHBOARD ERROR:", error);
    return res.status(500).json({
      message: "Failed to load dashboard stats",
    });
  }
};
