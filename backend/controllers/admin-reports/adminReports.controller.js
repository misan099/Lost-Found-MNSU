const db = require("../../models");

const { User, LostItem, FoundItem, Claim } = db;

const safeNumber = (value) => Number(value) || 0;

exports.getAdminReports = async (req, res) => {
  try {
    const [
      totalUsers,
      totalLost,
      totalFound,
      totalClaims,
      resolvedLost,
      resolvedFound,
      claimPending,
      claimVerified,
      claimRejected,
      userActive,
      userSuspended,
      userBlocked,
    ] = await Promise.all([
      User.count(),
      LostItem.count(),
      FoundItem.count(),
      Claim.count(),
      LostItem.count({ where: { status: "resolved" } }),
      FoundItem.count({ where: { status: "resolved" } }),
      Claim.count({ where: { status: "pending" } }),
      Claim.count({ where: { status: "verified" } }),
      Claim.count({ where: { status: "rejected" } }),
      User.count({ where: { status: "active" } }),
      User.count({ where: { status: "suspended" } }),
      User.count({ where: { status: "blocked" } }),
    ]);

    const totalResolved = safeNumber(resolvedLost) + safeNumber(resolvedFound);

    return res.json({
      totals: {
        users: safeNumber(totalUsers),
        lost: safeNumber(totalLost),
        found: safeNumber(totalFound),
        claims: safeNumber(totalClaims),
        resolved: totalResolved,
      },
      items: {
        lost: safeNumber(totalLost),
        found: safeNumber(totalFound),
        resolved: totalResolved,
      },
      claims: {
        pending: safeNumber(claimPending),
        verified: safeNumber(claimVerified),
        rejected: safeNumber(claimRejected),
      },
      users: {
        active: safeNumber(userActive),
        suspended: safeNumber(userSuspended),
        blocked: safeNumber(userBlocked),
      },
    });
  } catch (error) {
    console.error("ADMIN REPORTS ERROR:", error);
    return res.status(500).json({
      message: "Failed to load reports",
    });
  }
};
