"use strict";

const db = require("../models");

const Claim = db.Claim;
const FoundItem = db.FoundItem;
const LostItem = db.LostItem;
const MessageThread = db.MessageThread;
const Confirmation = db.Confirmation;

const fetchClaimForChat = async (claimId) =>
  Claim.findByPk(claimId, {
    include: [
      {
        model: FoundItem,
        as: "foundItem",
        attributes: ["id", "user_id", "status"],
      },
      {
        model: LostItem,
        as: "lostItem",
        attributes: ["id", "user_id", "status"],
      },
      {
        model: MessageThread,
        as: "thread",
        attributes: ["id", "status"],
        include: [
          {
            model: Confirmation,
            as: "confirmation",
            attributes: ["id", "owner_confirmed", "finder_confirmed"],
          },
        ],
      },
    ],
  });

const getClaimParticipants = (claim) => {
  const isFoundClaim = Boolean(
    claim?.found_item_id || claim?.foundItem?.id
  );
  const ownerId = isFoundClaim
    ? claim?.claimant_user_id
    : claim?.lostItem?.user_id;
  const finderId = isFoundClaim
    ? claim?.foundItem?.user_id
    : claim?.claimant_user_id;
  const itemStatus = isFoundClaim
    ? claim?.foundItem?.status
    : claim?.lostItem?.status;

  return { ownerId, finderId, itemStatus };
};

const isParticipant = (user, claim) => {
  if (!user || !claim) return false;
  if (user.role === "admin") return true;
  const { ownerId, finderId } = getClaimParticipants(claim);
  if (user.id === ownerId) return true;
  if (user.id === finderId) return true;
  return false;
};

const getChatStatus = (claim) => {
  const ownerConfirmed = Boolean(
    claim?.thread?.confirmation?.owner_confirmed
  );
  const finderConfirmed = Boolean(
    claim?.thread?.confirmation?.finder_confirmed
  );
  const bothConfirmed = ownerConfirmed && finderConfirmed;
  const isRejected = claim?.status === "rejected";
  const { itemStatus } = getClaimParticipants(claim);
  const isResolved =
    claim?.status === "resolved" ||
    claim?.thread?.status === "closed" ||
    itemStatus === "resolved";
  const isAwaitingResolution =
    claim?.status === "awaiting_admin_resolution" ||
    (bothConfirmed &&
      (claim?.status === "verified" || claim?.status === "approved"));
  const isVerified =
    (claim?.status === "verified" || claim?.status === "approved") &&
    !isAwaitingResolution;
  const status = isResolved
    ? "resolved"
    : isRejected
      ? "rejected"
      : isAwaitingResolution
        ? "awaiting_resolution"
        : isVerified
          ? "verified"
          : "pending";

  return {
    status,
    isVerified,
    isAwaitingResolution,
    isRejected,
    isResolved,
    ownerConfirmed,
    finderConfirmed,
    bothConfirmed,
    canSend: isVerified && !isRejected && !isResolved && !bothConfirmed,
  };
};

const getSenderRole = (user, claim) => {
  if (!user || !claim) return "admin";
  if (user.role === "admin") return "admin";
  const { ownerId, finderId } = getClaimParticipants(claim);
  if (user.id === ownerId) return "owner";
  if (user.id === finderId) return "finder";
  return "admin";
};

const getSenderRoleById = (senderId, claim, sender) => {
  if (sender?.role === "admin") return "admin";
  const { ownerId, finderId } = getClaimParticipants(claim);
  if (senderId === ownerId) return "owner";
  if (senderId === finderId) return "finder";
  return "admin";
};

const ensureThreadForClaim = async (claim) => {
  if (!claim) return null;
  let thread = claim.thread;
  if (!thread) {
    thread = await MessageThread.create({
      claim_id: claim.id,
      status: "open",
    });
  }

  let confirmation = thread.confirmation;
  if (!confirmation) {
    confirmation = await Confirmation.create({
      thread_id: thread.id,
    });
  }

  return { thread, confirmation };
};

module.exports = {
  fetchClaimForChat,
  getChatStatus,
  getSenderRole,
  getSenderRoleById,
  isParticipant,
  ensureThreadForClaim,
};
