"use strict";

const { Op } = require("sequelize");
const db = require("../models");
const { ensureThreadForClaim } = require("../utils/chatHelpers");
const {
  formatAccountDate,
  getUserStatusPayload,
  resolveUserStatus,
} = require("../utils/userStatus");

const User = db.User;
const Claim = db.Claim;
const FoundItem = db.FoundItem;
const LostItem = db.LostItem;
const MessageThread = db.MessageThread;
const Message = db.Message;

const getStatusLabel = (status) => {
  if (status === "suspended") return "Suspended";
  if (status === "blocked") return "Blocked";
  return "Active";
};

const buildAccountMessage = ({ status, note, suspendedUntil }) => {
  if (status === "blocked") {
    return note
      ? `Your account has been blocked. Note: ${note}`
      : "Your account has been blocked. Please contact support.";
  }
  if (status === "suspended") {
    const untilLabel = suspendedUntil
      ? formatAccountDate(suspendedUntil)
      : "a later date";
    return note
      ? `Your account is suspended until ${untilLabel}. Note: ${note}`
      : `Your account is suspended until ${untilLabel}.`;
  }
  return note
    ? `Your account is active again. Note: ${note}`
    : "Your account is active again. You can now use all features.";
};

const sendAccountNotice = async ({ userId, adminId, message }) => {
  if (!message) return;

  const claims = await Claim.findAll({
    attributes: ["id"],
    include: [
      {
        model: FoundItem,
        as: "foundItem",
        attributes: ["id", "user_id"],
      },
      {
        model: LostItem,
        as: "lostItem",
        attributes: ["id", "user_id"],
      },
      {
        model: MessageThread,
        as: "thread",
        attributes: ["id"],
      },
    ],
    where: {
      [Op.or]: [
        { claimant_user_id: userId },
        { "$foundItem.user_id$": userId },
        { "$lostItem.user_id$": userId },
      ],
    },
    order: [["createdAt", "DESC"]],
    subQuery: false,
  });

  if (!claims.length) return;

  await Promise.all(
    claims.map(async (claim) => {
      const threadData = await ensureThreadForClaim(claim);
      if (!threadData?.thread?.id) return;
      await Message.create({
        thread_id: threadData.thread.id,
        claim_id: claim.id,
        sender_id: adminId,
        sender_role: "admin",
        type: "system",
        message_text: message,
      });
    })
  );
};

const mapUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  status: user.status,
  statusLabel: getStatusLabel(user.status),
  joinedAt:
    user.createdAt || user.created_at || user.get?.("createdAt") || null,
  ...getUserStatusPayload(user),
});

const getAdminUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: [
        "id",
        "name",
        "email",
        "role",
        "status",
        "suspended_until",
        "suspension_note",
        "blocked_note",
        "createdAt",
      ],
      order: [["createdAt", "DESC"]],
    });

    const refreshed = await Promise.all(
      users.map(async (user) => {
        await resolveUserStatus(user);
        return mapUser(user);
      })
    );

    return res.json(refreshed);
  } catch (error) {
    console.error("ADMIN USERS FETCH ERROR:", error);
    return res.status(500).json({
      message: "Unable to load users",
    });
  }
};

const suspendUser = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    if (!userId) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const durationDays = Number(req.body?.durationDays);
    const note = typeof req.body?.note === "string" ? req.body.note.trim() : "";
    if (![1, 2].includes(durationDays)) {
      return res.status(400).json({
        message: "Suspension duration must be 1 or 2 days",
      });
    }
    if (!note) {
      return res.status(400).json({
        message: "Suspension note is required",
      });
    }

    const target = await User.findByPk(userId);
    if (!target) {
      return res.status(404).json({ message: "User not found" });
    }
    if (target.role === "admin") {
      return res.status(403).json({ message: "Cannot suspend admin accounts" });
    }

    const suspendedUntil = new Date(
      Date.now() + durationDays * 24 * 60 * 60 * 1000
    );

    await target.update({
      status: "suspended",
      suspended_until: suspendedUntil,
      suspension_note: note,
      blocked_note: null,
    });

    const message = buildAccountMessage({
      status: "suspended",
      note,
      suspendedUntil,
    });

    await sendAccountNotice({
      userId: target.id,
      adminId: req.user.id,
      message,
    });

    return res.json({
      message: "User suspended",
      user: mapUser(target),
    });
  } catch (error) {
    console.error("SUSPEND USER ERROR:", error);
    return res.status(500).json({ message: "Unable to suspend user" });
  }
};

const blockUser = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    if (!userId) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const note = typeof req.body?.note === "string" ? req.body.note.trim() : "";
    if (!note) {
      return res.status(400).json({
        message: "Block note is required",
      });
    }

    const target = await User.findByPk(userId);
    if (!target) {
      return res.status(404).json({ message: "User not found" });
    }
    if (target.role === "admin") {
      return res.status(403).json({ message: "Cannot block admin accounts" });
    }

    await target.update({
      status: "blocked",
      blocked_note: note,
      suspended_until: null,
      suspension_note: null,
    });

    const message = buildAccountMessage({
      status: "blocked",
      note,
    });

    await sendAccountNotice({
      userId: target.id,
      adminId: req.user.id,
      message,
    });

    return res.json({
      message: "User blocked",
      user: mapUser(target),
    });
  } catch (error) {
    console.error("BLOCK USER ERROR:", error);
    return res.status(500).json({ message: "Unable to block user" });
  }
};

const activateUser = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    if (!userId) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const note = typeof req.body?.note === "string" ? req.body.note.trim() : "";
    const target = await User.findByPk(userId);
    if (!target) {
      return res.status(404).json({ message: "User not found" });
    }
    if (target.role === "admin") {
      return res.status(403).json({ message: "Cannot modify admin accounts" });
    }

    await target.update({
      status: "active",
      suspended_until: null,
      suspension_note: null,
      blocked_note: null,
    });

    const message = buildAccountMessage({
      status: "active",
      note,
    });

    await sendAccountNotice({
      userId: target.id,
      adminId: req.user.id,
      message,
    });

    return res.json({
      message: "User activated",
      user: mapUser(target),
    });
  } catch (error) {
    console.error("ACTIVATE USER ERROR:", error);
    return res.status(500).json({ message: "Unable to activate user" });
  }
};

module.exports = {
  getAdminUsers,
  suspendUser,
  blockUser,
  activateUser,
};
