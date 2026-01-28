"use strict";

const formatAccountDate = (value) => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value);
  return parsed.toLocaleString("en-NP", {
    timeZone: "Asia/Kathmandu",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const isSuspensionActive = (user) => {
  if (!user || user.status !== "suspended") return false;
  if (!user.suspended_until) return false;
  return new Date(user.suspended_until).getTime() > Date.now();
};

const resolveUserStatus = async (user) => {
  if (!user) return null;
  if (user.status !== "suspended") return user;
  if (isSuspensionActive(user)) return user;

  await user.update({
    status: "active",
    suspended_until: null,
    suspension_note: null,
  });

  return user;
};

const getAccountNotice = (user) => {
  if (!user) return null;

  if (user.status === "blocked") {
    const note = user.blocked_note || "";
    const message = note
      ? `Your account has been blocked. Note: ${note}`
      : "Your account has been blocked. Please contact support.";
    return {
      status: "blocked",
      message,
      note,
      suspendedUntil: null,
    };
  }

  if (isSuspensionActive(user)) {
    const untilLabel = formatAccountDate(user.suspended_until);
    const note = user.suspension_note || "";
    const message = note
      ? `Your account is suspended until ${untilLabel}. Note: ${note}`
      : `Your account is suspended until ${untilLabel}.`;
    return {
      status: "suspended",
      message,
      note,
      suspendedUntil: user.suspended_until,
    };
  }

  return null;
};

const getUserStatusPayload = (user) => ({
  status: user?.status || "active",
  suspendedUntil: user?.suspended_until || null,
  suspensionNote: user?.suspension_note || null,
  blockedNote: user?.blocked_note || null,
});

module.exports = {
  formatAccountDate,
  getAccountNotice,
  getUserStatusPayload,
  isSuspensionActive,
  resolveUserStatus,
};
