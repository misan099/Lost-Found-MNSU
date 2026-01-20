"use strict";
const db = require("../models");
const { Op } = require("sequelize");
const Claim = db.Claim;
const FoundItem = db.FoundItem;
const LostItem = db.LostItem;
const MessageThread = db.MessageThread;
const Confirmation = db.Confirmation;
const Message = db.Message;
const User = db.User;
const {
  fetchClaimForChat,
  getChatStatus,
  getSenderRole,
  getSenderRoleById,
  isParticipant,
  ensureThreadForClaim,
} = require("../utils/chatHelpers");
const getClaimColumns = async () => Claim.describe();
const normalizeOptionalText = (value) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};
const buildFileUrl = (req, url) => {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  if (url.startsWith("/")) return `${baseUrl}${url}`;
  return `${baseUrl}/${url}`;
};
const ADMIN_STATUS_FILTER = [
  "Pending Verification",
  "Rejected",
  "Verified",
  "Awaiting Resolution",
  "Resolved",
];
const deriveAdminStatus = (claim) => {
  const rawStatus = claim.status;
  if (ADMIN_STATUS_FILTER.includes(rawStatus)) return rawStatus;
  const thread = claim.thread;
  const confirmation = thread?.confirmation;
  const bothConfirmed =
    confirmation?.owner_confirmed && confirmation?.finder_confirmed;
  if (rawStatus === "resolved" || thread?.status === "closed") {
    return "Resolved";
  }
  if (
    rawStatus === "awaiting_admin_resolution" ||
    (bothConfirmed && (rawStatus === "verified" || rawStatus === "approved"))
  ) {
    return "Awaiting Resolution";
  }
  if (rawStatus === "verified" || rawStatus === "approved") {
    return "Verified";
  }
  if (rawStatus === "pending") return "Pending Verification";
  if (rawStatus === "rejected") return "Rejected";
  return rawStatus;
};
/* ======================================================
   USER: CLAIMS WITH MESSAGES
====================================================== */
const getUserClaimsWithMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const claimColumns = await getClaimColumns();
    const claimAttributes = [
      "id",
      "found_item_id",
      "claimant_user_id",
      "status",
      "created_at",
    ];
    if (claimColumns.lost_item_id) {
      claimAttributes.push("lost_item_id");
    }
    if (claimColumns.verification_text) {
      claimAttributes.push("verification_text");
    }
    if (claimColumns.admin_note) {
      claimAttributes.push("admin_note");
    }
    if (claimColumns.updated_at) {
      claimAttributes.push("updated_at");
    }
    const claims = await Claim.findAll({
      attributes: claimAttributes,
      include: [
        {
          model: FoundItem,
          as: "foundItem",
          attributes: [
            "id",
            "item_name",
            "location",
            "image_url",
            "image_path",
            "user_id",
            "status",
          ],
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "name"],
            },
          ],
        },
        {
          model: LostItem,
          as: "lostItem",
          attributes: [
            "id",
            "item_name",
            "location",
            "image_url",
            "image_path",
            "user_id",
            "status",
          ],
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "name"],
            },
          ],
        },
        {
          model: User,
          as: "claimant",
          attributes: ["id", "name"],
        },
        {
          model: MessageThread,
          as: "thread",
          attributes: ["id", "status"],
          include: [
            {
              model: Confirmation,
              as: "confirmation",
              attributes: ["owner_confirmed", "finder_confirmed"],
            },
          ],
        },
      ],
      where: {
        [Op.or]: [
          { claimant_user_id: userId },
          { "$foundItem.user_id$": userId },
          { "$lostItem.user_id$": userId },
        ],
      },
      order: [["created_at", "DESC"]],
      subQuery: false,
    });
    const threadIds = [
      ...new Set(
        claims
          .map((claim) => claim.thread?.id)
          .filter(Boolean)
      ),
    ];
    const lastMessages = threadIds.length
      ? await Message.findAll({
          attributes: ["thread_id", "message_text", "created_at"],
          where: { thread_id: { [Op.in]: threadIds } },
          order: [["created_at", "DESC"]],
          raw: true,
        })
      : [];
    const lastMessageMap = new Map();
    lastMessages.forEach((row) => {
      if (!lastMessageMap.has(row.thread_id)) {
        lastMessageMap.set(row.thread_id, {
          text: row.message_text,
          created_at: row.created_at,
        });
      }
    });
    const payload = claims.map((claim) => {
      const chatStatus = getChatStatus(claim);
      const isFoundClaim = Boolean(
        claim.found_item_id || claim.foundItem?.id
      );
      const ownerId = isFoundClaim
        ? claim.claimant_user_id
        : claim.lostItem?.user_id;
      const finderId = isFoundClaim
        ? claim.foundItem?.user_id
        : claim.claimant_user_id;
      const isOwner = ownerId === userId;
      const isFinder = finderId === userId;
      const lastMessage = lastMessageMap.get(claim.thread?.id);
      const fallbackRejectionMessage =
        claim.status === "rejected"
          ? claim.admin_note
            ? `Admin rejected this claim. Note: ${claim.admin_note}`
            : "Admin rejected this claim."
          : null;
      const ownerName = isFoundClaim
        ? claim.claimant?.name || "Owner"
        : claim.lostItem?.user?.name || "Owner";
      const finderName = isFoundClaim
        ? claim.foundItem?.user?.name || "Finder"
        : claim.claimant?.name || "Finder";
      const otherPartyName = isOwner ? finderName : ownerName;
      const item = isFoundClaim ? claim.foundItem : claim.lostItem;
      return {
        id: claim.id,
        status: chatStatus.status,
        ownerConfirmed: chatStatus.ownerConfirmed,
        finderConfirmed: chatStatus.finderConfirmed,
        canSend: chatStatus.canSend,
        role: isOwner ? "owner" : isFinder ? "finder" : "viewer",
        item: {
          id: item?.id || null,
          name: item?.item_name || "Unknown item",
          location: item?.location || "Unknown location",
          imageUrl: buildFileUrl(
            req,
            item?.image_url || item?.image_path || null
          ),
        },
        ownerName,
        finderName,
        otherPartyName,
        lastMessage:
          lastMessage?.text || fallbackRejectionMessage || null,
        lastMessageAt:
          lastMessage?.created_at ||
          (fallbackRejectionMessage
            ? claim.updated_at || claim.created_at || null
            : null),
      };
    });
    return res.json(payload);
  } catch (error) {
    console.error("USER CLAIMS WITH MESSAGES ERROR:", error);
    return res.status(500).json({
      message: "Failed to fetch claim conversations",
    });
  }
};
const createClaim = async (req, res) => {
  try {
    const foundItemId =
      req.body?.found_item_id ?? req.body?.foundItemId;
    const lostItemId =
      req.body?.lost_item_id ?? req.body?.lostItemId;
    const rawVerificationText =
      req.body?.verification_text ?? req.body?.verificationText;
    const rawVerificationType =
      req.body?.verification_type ?? req.body?.verificationType;
    const rawAdditionalContext =
      req.body?.additional_context ?? req.body?.additionalContext;
    const claimant_user_id = req.user.id;
    const claimColumns = await getClaimColumns();
    const normalizedVerificationText = normalizeOptionalText(
      rawVerificationText
    );
    const normalizedVerificationType = normalizeOptionalText(
      rawVerificationType
    );
    const normalizedAdditionalContext = normalizeOptionalText(
      rawAdditionalContext
    );
    if (!normalizedVerificationText) {
      return res.status(400).json({
        message: "Verification statement is required",
      });
    }
    if ((!foundItemId && !lostItemId) || (foundItemId && lostItemId)) {
      return res.status(400).json({
        message: "Please provide a found or lost item to claim",
      });
    }
    const isFoundClaim = Boolean(foundItemId);
    const item = isFoundClaim
      ? await FoundItem.findByPk(foundItemId)
      : await LostItem.findByPk(lostItemId);
    if (!item) {
      return res.status(404).json({
        message: isFoundClaim ? "Found item not found" : "Lost item not found",
      });
    }
    // ✅ Correct availability check (lowercase)
    if (isFoundClaim && item.status !== "available") {
      return res.status(400).json({
        message: "This item is not available for claiming",
      });
    }
    if (!isFoundClaim && item.status !== "pending") {
      return res.status(400).json({
        message: "This item is not available for claiming",
      });
    }
    // ✅ Create claim
    const proofImageUrl = req.file
      ? `/uploads/found-items/${req.file.filename}`
      : null;
    const claimPayload = {
      ...(isFoundClaim ? { found_item_id: foundItemId } : {}),
      ...(!isFoundClaim ? { lost_item_id: lostItemId } : {}),
      claimant_user_id,
      verification_text: normalizedVerificationText,
      status: "pending",
    };
    if (claimColumns.verification_type) {
      claimPayload.verification_type = normalizedVerificationType;
    }
    if (claimColumns.additional_context) {
      claimPayload.additional_context = normalizedAdditionalContext;
    }
    if (claimColumns.proof_image_url && proofImageUrl) {
      claimPayload.proof_image_url = proofImageUrl;
    }
    const returningFields = ["id", "created_at", "updated_at"].filter(
      (field) => claimColumns[field]
    );
    Object.keys(claimPayload).forEach((field) => {
      if (claimColumns[field] && !returningFields.includes(field)) {
        returningFields.push(field);
      }
    });
    const claim = await Claim.create(claimPayload, {
      fields: Object.keys(claimPayload),
      returning: returningFields,
    });
    // ✅ Lock the item
    if (isFoundClaim) {
      await item.update({ status: "claim_requested" });
    } else {
      await item.update({ status: "matched" });
    }
    return res.status(201).json({
      message: "Claim request submitted successfully",
      claim,
    });
  } catch (error) {
    console.error("❌ CREATE CLAIM ERROR:", error);
    return res.status(500).json({
      message: "Failed to submit claim",
    });
  }
};
/* ======================================================
   ADMIN: CLAIMS WITH MESSAGES
====================================================== */
const getAdminClaimsWithMessages = async (req, res) => {
  try {
    const claimColumns = await getClaimColumns();
    const claimAttributes = [
      "id",
      "found_item_id",
      "claimant_user_id",
      "verification_text",
      "status",
    ];
    const createdAtField = claimColumns.created_at
      ? "created_at"
      : "createdAt";
    if (!claimAttributes.includes(createdAtField)) {
      claimAttributes.push(createdAtField);
    }
    if (claimColumns.lost_item_id) {
      claimAttributes.push("lost_item_id");
    }
    if (claimColumns.verification_type) {
      claimAttributes.push("verification_type");
    }
    if (claimColumns.additional_context) {
      claimAttributes.push("additional_context");
    }
    if (claimColumns.proof_image_url) {
      claimAttributes.push("proof_image_url");
    }
    const claims = await Claim.findAll({
      attributes: claimAttributes,
      include: [
        {
          model: FoundItem,
          as: "foundItem",
          attributes: [
            "id",
            "item_name",
            "category",
            "public_description",
            "area",
            "exact_location",
            "location",
            "date_found",
            "image_url",
            "image_path",
            "admin_only_identifiers",
            "admin_verification_details",
            "hidden_marks",
            "verification_notes",
            "user_id",
          ],
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "name"],
            },
          ],
        },
        {
          model: LostItem,
          as: "lostItem",
          attributes: [
            "id",
            "item_name",
            "category",
            "public_description",
            "description",
            "area",
            "exact_location",
            "location",
            "date_lost",
            "image_url",
            "image_path",
            "admin_verification_details",
            "hidden_marks",
            "verification_notes",
            "user_id",
          ],
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "name"],
            },
          ],
        },
        {
          model: User,
          as: "claimant",
          attributes: ["id", "name"],
        },
        {
          model: MessageThread,
          as: "thread",
          attributes: ["id", "status"],
          include: [
            {
              model: Confirmation,
              as: "confirmation",
              attributes: ["owner_confirmed", "finder_confirmed"],
            },
          ],
        },
      ],
      order: [["created_at", "DESC"]],
    });
    const threadIds = [
      ...new Set(
        claims
          .map((claim) => claim.thread?.id)
          .filter(Boolean)
      ),
    ];
    const lastMessageRows = threadIds.length
      ? await Message.findAll({
          attributes: [
            "thread_id",
            [
              db.Sequelize.fn(
                "MAX",
                db.Sequelize.col("created_at")
              ),
              "last_message_at",
            ],
          ],
          where: { thread_id: { [Op.in]: threadIds } },
          group: ["thread_id"],
          raw: true,
        })
      : [];
    const lastMessageMap = new Map(
      lastMessageRows.map((row) => [
        row.thread_id,
        row.last_message_at,
      ])
    );
    const payload = claims
      .map((claim) => {
        const status = deriveAdminStatus(claim);
        const confirmation = claim.thread?.confirmation;
        const isFoundClaim = Boolean(
          claim.found_item_id || claim.foundItem?.id
        );
        const claimType = isFoundClaim ? "found" : "lost";
        const lostItem = claim.lostItem || null;
        const foundItem = claim.foundItem || null;
        const lostItemAdminDetails = {
          verificationDetails:
            lostItem?.admin_verification_details || null,
          hiddenMarks: lostItem?.hidden_marks || null,
          notes: lostItem?.verification_notes || null,
        };
        const foundItemAdminDetails = {
          verificationDetails:
            foundItem?.admin_verification_details ||
            foundItem?.admin_only_identifiers ||
            null,
          hiddenMarks: foundItem?.hidden_marks || null,
          notes: foundItem?.verification_notes || null,
        };
        const claimCreatedAt =
          claim.createdAt ||
          claim.created_at ||
          claim.get?.("createdAt") ||
          claim.get?.("created_at") ||
          null;
        const lostOwner = isFoundClaim ? claim.claimant : lostItem?.user;
        const finder = isFoundClaim ? foundItem?.user : claim.claimant;
        return {
          id: claim.id,
          status,
          claimType,
          created_at: claimCreatedAt,
          createdAt: claimCreatedAt,
          ownerConfirmed: Boolean(
            confirmation?.owner_confirmed
          ),
          finderConfirmed: Boolean(
            confirmation?.finder_confirmed
          ),
          lostItem: {
            id: lostItem?.id || null,
            name: lostItem?.item_name || null,
            category: lostItem?.category || null,
            area: lostItem?.area || null,
            exactLocation: lostItem?.exact_location || null,
            publicDescription:
              lostItem?.public_description || lostItem?.description || null,
            description:
              lostItem?.public_description ||
              lostItem?.description ||
              null,
            location: lostItem?.location || null,
            date: lostItem?.date_lost || null,
            imageUrl:
              lostItem?.image_url || lostItem?.image_path || null,
            adminDetails: lostItemAdminDetails,
          },
          foundItem: {
            id: foundItem?.id || null,
            name: foundItem?.item_name || null,
            category: foundItem?.category || null,
            area: foundItem?.area || null,
            exactLocation: foundItem?.exact_location || null,
            publicDescription: foundItem?.public_description || null,
            description: foundItem?.public_description || null,
            location: foundItem?.location || null,
            date: foundItem?.date_found || null,
            imageUrl:
              foundItem?.image_url ||
              foundItem?.image_path ||
              null,
            adminDetails: foundItemAdminDetails,
          },
          lostOwner: {
            id: lostOwner?.id || null,
            name: lostOwner?.name || null,
          },
          finder: {
            id: finder?.id || null,
            name: finder?.name || null,
          },
          claimDetails: {
            text: claim.verification_text || null,
            type: claim.verification_type || null,
            additionalContext: claim.additional_context || null,
            proofImageUrl: buildFileUrl(
              req,
              claim.proof_image_url || null
            ),
            createdAt: claimCreatedAt,
          },
          lastMessageAt:
            lastMessageMap.get(claim.thread?.id) || null,
        };
      })
      .filter((claim) =>
        ADMIN_STATUS_FILTER.includes(claim.status)
      );
    return res.json(payload);
  } catch (error) {
    console.error("ADMIN CLAIMS WITH MESSAGES ERROR:", error);
    return res.status(500).json({
      message: "Failed to fetch admin claims with messages",
    });
  }
};
/* ======================================================
   ADMIN: CLAIM MESSAGES
====================================================== */
const getAdminClaimMessages = async (req, res) => {
  try {
    const claimId = Number(req.params.claimId);
    if (!claimId) {
      return res.status(400).json({
        message: "Invalid claim id",
      });
    }
    const claimColumns = await getClaimColumns();
    const claimAttributes = [
      "id",
      "found_item_id",
      "claimant_user_id",
      "status",
    ];
    if (claimColumns.lost_item_id) {
      claimAttributes.push("lost_item_id");
    }
    if (claimColumns.verification_text) {
      claimAttributes.push("verification_text");
    }
    const claim = await Claim.findByPk(claimId, {
      attributes: claimAttributes,
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
    });
    if (!claim) {
      return res.status(404).json({
        message: "Claim not found",
      });
    }
    if (!claim.thread) {
      return res.json([]);
    }
    const messages = await Message.findAll({
      where: { thread_id: claim.thread.id },
      order: [["created_at", "ASC"]],
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "role"],
        },
      ],
    });
    const payload = messages.map((message) => {
      const senderRole = getSenderRoleById(
        message.sender_id,
        claim,
        message.sender
      );
      const messageType =
        message.type || (senderRole === "admin" ? "system" : "user");
      return {
        id: message.id,
        sender_id: message.sender_id,
        sender_role: senderRole,
        type: messageType,
        text: message.message_text,
        created_at: message.created_at,
      };
    });
    return res.json(payload);
  } catch (error) {
    console.error("ADMIN CLAIM MESSAGES ERROR:", error);
    return res.status(500).json({
      message: "Failed to fetch claim messages",
    });
  }
};
/* ======================================================
   ADMIN: VERIFY CLAIM
====================================================== */
const verifyClaim = async (req, res) => {
  try {
    const claimId = Number(req.params.claimId);
    if (!claimId) {
      return res.status(400).json({
        message: "Invalid claim id",
      });
    }
    const { note } = req.body || {};
    const claim = await Claim.findByPk(claimId);
    if (!claim) {
      return res.status(404).json({
        message: "Claim not found",
      });
    }
    if (claim.status !== "pending") {
      return res.status(400).json({
        message: "Claim cannot be verified in its current state",
      });
    }
    await claim.update({
      status: "verified",
      admin_note: note?.trim() || null,
    });
    const claimWithThread = await Claim.findByPk(claimId, {
      include: [
        {
          model: MessageThread,
          as: "thread",
          include: [
            {
              model: Confirmation,
              as: "confirmation",
              attributes: ["owner_confirmed", "finder_confirmed"],
            },
          ],
        },
      ],
    });
    await ensureThreadForClaim(claimWithThread);
    if (claim.found_item_id) {
      await FoundItem.update(
        { status: "verified" },
        { where: { id: claim.found_item_id } }
      );
    }
    if (claim.lost_item_id) {
      await LostItem.update(
        { status: "matched" },
        { where: { id: claim.lost_item_id } }
      );
    }
    if (claimWithThread?.thread) {
      await Message.create({
        thread_id: claimWithThread.thread.id,
        claim_id: claim.id,
        sender_id: req.user.id,
        sender_role: "admin",
        type: "system",
        message_text:
          "Admin verified this claim. You can now chat with each other.",
      });
    }
    return res.json({
      message: "Claim verified successfully",
    });
  } catch (error) {
    console.error("ADMIN VERIFY CLAIM ERROR:", error);
    return res.status(500).json({
      message: "Failed to verify claim",
    });
  }
};
/* ======================================================
   ADMIN: REJECT CLAIM
====================================================== */
const rejectClaim = async (req, res) => {
  try {
    const claimId = Number(req.params.claimId);
    if (!claimId) {
      return res.status(400).json({
        message: "Invalid claim id",
      });
    }
    const { note } = req.body || {};
    const claim = await Claim.findByPk(claimId);
    if (!claim) {
      return res.status(404).json({
        message: "Claim not found",
      });
    }
    const trimmedNote = note?.trim() || null;
    await claim.update({
      status: "rejected",
      admin_note: trimmedNote,
    });
    const claimWithThread = await Claim.findByPk(claimId, {
      include: [
        {
          model: MessageThread,
          as: "thread",
          include: [
            {
              model: Confirmation,
              as: "confirmation",
              attributes: ["owner_confirmed", "finder_confirmed"],
            },
          ],
        },
      ],
    });
    const threadData = await ensureThreadForClaim(claimWithThread);
    const rejectionMessage = trimmedNote
      ? `Admin rejected this claim. Note: ${trimmedNote}`
      : "Admin rejected this claim.";
    await Message.create({
      thread_id: threadData.thread.id,
      claim_id: claim.id,
      sender_id: req.user.id,
      sender_role: "admin",
      type: "system",
      message_text: rejectionMessage,
    });
    return res.json({
      message: "Claim rejected successfully",
    });
  } catch (error) {
    console.error("ADMIN REJECT CLAIM ERROR:", error);
    return res.status(500).json({
      message: "Failed to reject claim",
    });
  }
};
/* ======================================================
   ADMIN: RESOLVE CLAIM
====================================================== */
const resolveClaim = async (req, res) => {
  try {
    const claimId = Number(req.params.claimId);
    if (!claimId) {
      return res.status(400).json({
        message: "Invalid claim id",
      });
    }
    const claim = await Claim.findByPk(claimId, {
      include: [
        {
          model: MessageThread,
          as: "thread",
          include: [
            {
              model: Confirmation,
              as: "confirmation",
              attributes: ["owner_confirmed", "finder_confirmed"],
            },
          ],
        },
        {
          model: FoundItem,
          as: "foundItem",
          attributes: ["id", "status"],
        },
        {
          model: LostItem,
          as: "lostItem",
          attributes: ["id", "status"],
        },
      ],
    });
    if (!claim) {
      return res.status(404).json({
        message: "Claim not found",
      });
    }
    const confirmation = claim.thread?.confirmation;
    if (!confirmation) {
      return res.status(400).json({
        message: "Confirmation record not found",
      });
    }
    if (
      !confirmation.owner_confirmed ||
      !confirmation.finder_confirmed
    ) {
      return res.status(400).json({
        message: "Both users must confirm before resolving",
      });
    }
    if (claim.status === "resolved") {
      return res.status(400).json({
        message: "Claim is already resolved",
      });
    }
    await claim.update({ status: "resolved" });
    if (claim.thread?.status !== "closed") {
      await claim.thread?.update({ status: "closed" });
    }
    if (claim.foundItem?.status !== "resolved") {
      await claim.foundItem?.update({ status: "resolved" });
    }
    if (claim.lostItem?.status !== "resolved") {
      await claim.lostItem?.update({ status: "resolved" });
    }
    if (claim.thread?.id) {
      await Message.create({
        thread_id: claim.thread.id,
        claim_id: claim.id,
        sender_id: req.user.id,
        sender_role: "admin",
        type: "system",
        message_text:
          "Admin resolved this claim. This chat is now read-only.",
      });
    }
    return res.json({
      message: "Claim resolved successfully",
    });
  } catch (error) {
    console.error("ADMIN RESOLVE CLAIM ERROR:", error);
  return res.status(500).json({
    message: "Failed to resolve claim",
  });
}
};
/* ======================================================
   USER: CONFIRM OWNER RECEIVED
====================================================== */
const confirmOwnerReceived = async (req, res) => {
  try {
    const claimId = Number(req.params.claimId);
    if (!claimId) {
      return res.status(400).json({
        message: "Invalid claim id",
      });
    }
    const claim = await fetchClaimForChat(claimId);
    if (!claim) {
      return res.status(404).json({
        message: "Claim not found",
      });
    }
    if (getSenderRole(req.user, claim) !== "owner") {
      return res.status(403).json({
        message: "Not authorized to confirm this claim",
      });
    }
    const chatStatus = getChatStatus(claim);
    if (!chatStatus.isVerified) {
      return res.status(400).json({
        message: "Claim must be verified before confirmation",
      });
    }
    if (chatStatus.isRejected || chatStatus.isResolved) {
      return res.status(400).json({
        message: "This claim is closed",
      });
    }
    const threadData = await ensureThreadForClaim(claim);
    let confirmation = threadData.confirmation;
    const wasOwnerConfirmed = Boolean(confirmation.owner_confirmed);
    if (!wasOwnerConfirmed) {
      confirmation = await confirmation.update({
        owner_confirmed: true,
      });
    }
    const ownerConfirmed = Boolean(confirmation.owner_confirmed);
    const finderConfirmed = Boolean(confirmation.finder_confirmed);
    let claimStatus = claim.status;
    if (!wasOwnerConfirmed && threadData?.thread?.id) {
      const senderRole = getSenderRole(req.user, claim);
      await Message.create({
        thread_id: threadData.thread.id,
        claim_id: claim.id,
        sender_id: req.user.id,
        sender_role: senderRole,
        type: "system",
        message_text: "Owner confirmed they received the item.",
      });
    }
    if (
      ownerConfirmed &&
      finderConfirmed &&
      claim.status !== "resolved"
    ) {
      const updatedClaim = await claim.update({
        status: "awaiting_admin_resolution",
      });
      claimStatus = updatedClaim.status;
    }
    return res.json({
      ownerConfirmed,
      finderConfirmed,
      bothConfirmed: ownerConfirmed && finderConfirmed,
      claimStatus,
    });
  } catch (error) {
    console.error("CONFIRM OWNER RECEIVED ERROR:", error);
    return res.status(500).json({
      message: "Failed to confirm owner receipt",
    });
  }
};
/* ======================================================
   USER: CONFIRM FINDER RETURNED
====================================================== */
const confirmFinderReturned = async (req, res) => {
  try {
    const claimId = Number(req.params.claimId);
    if (!claimId) {
      return res.status(400).json({
        message: "Invalid claim id",
      });
    }
    const claim = await fetchClaimForChat(claimId);
    if (!claim) {
      return res.status(404).json({
        message: "Claim not found",
      });
    }
    if (getSenderRole(req.user, claim) !== "finder") {
      return res.status(403).json({
        message: "Not authorized to confirm this claim",
      });
    }
    const chatStatus = getChatStatus(claim);
    if (!chatStatus.isVerified) {
      return res.status(400).json({
        message: "Claim must be verified before confirmation",
      });
    }
    if (chatStatus.isRejected || chatStatus.isResolved) {
      return res.status(400).json({
        message: "This claim is closed",
      });
    }
    const threadData = await ensureThreadForClaim(claim);
    let confirmation = threadData.confirmation;
    const wasFinderConfirmed = Boolean(confirmation.finder_confirmed);
    if (!wasFinderConfirmed) {
      confirmation = await confirmation.update({
        finder_confirmed: true,
      });
    }
    const ownerConfirmed = Boolean(confirmation.owner_confirmed);
    const finderConfirmed = Boolean(confirmation.finder_confirmed);
    let claimStatus = claim.status;
    if (!wasFinderConfirmed && threadData?.thread?.id) {
      const senderRole = getSenderRole(req.user, claim);
      await Message.create({
        thread_id: threadData.thread.id,
        claim_id: claim.id,
        sender_id: req.user.id,
        sender_role: senderRole,
        type: "system",
        message_text: "Finder confirmed they returned the item.",
      });
    }
    if (
      ownerConfirmed &&
      finderConfirmed &&
      claim.status !== "resolved"
    ) {
      const updatedClaim = await claim.update({
        status: "awaiting_admin_resolution",
      });
      claimStatus = updatedClaim.status;
    }
    return res.json({
      ownerConfirmed,
      finderConfirmed,
      bothConfirmed: ownerConfirmed && finderConfirmed,
      claimStatus,
    });
  } catch (error) {
    console.error("CONFIRM FINDER RETURNED ERROR:", error);
    return res.status(500).json({
      message: "Failed to confirm finder return",
    });
  }
};
/* ======================================================
   CLAIM CHAT: GET MESSAGES (PARTICIPANTS)
====================================================== */
const getClaimMessages = async (req, res) => {
  try {
    const claimId = Number(req.params.claimId);
    if (!claimId) {
      return res.status(400).json({
        message: "Invalid claim id",
      });
    }
    const claim = await fetchClaimForChat(claimId);
    if (!claim) {
      return res.status(404).json({
        message: "Claim not found",
      });
    }
    if (!isParticipant(req.user, claim)) {
      return res.status(403).json({
        message: "Not authorized to view this claim",
      });
    }
    if (!claim.thread) {
      if (claim.status === "rejected" && claim.admin_note) {
        return res.json([
          {
            id: `rejection-${claim.id}`,
            claim_id: claimId,
            sender_id: null,
            sender_role: "admin",
            type: "system",
            text: `Admin rejected this claim. Note: ${claim.admin_note}`,
            created_at: claim.updated_at || claim.created_at || null,
          },
        ]);
      }
      return res.json([]);
    }
    const messages = await Message.findAll({
      where: { thread_id: claim.thread.id },
      order: [["created_at", "ASC"]],
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "role"],
        },
      ],
    });
    let payload = messages.map((message) => {
      const senderRole =
        message.sender_role ||
        getSenderRoleById(message.sender_id, claim, message.sender);
      const messageType =
        message.type || (senderRole === "admin" ? "system" : "user");
      return {
        id: message.id,
        claim_id: claimId,
        sender_id: message.sender_id,
        sender_role: senderRole,
        type: messageType,
        text: message.message_text,
        created_at: message.created_at,
      };
    });
    if (
      payload.length === 0 &&
      claim.status === "rejected" &&
      claim.admin_note
    ) {
      payload = [
        {
          id: `rejection-${claim.id}`,
          claim_id: claimId,
          sender_id: null,
          sender_role: "admin",
          type: "system",
          text: `Admin rejected this claim. Note: ${claim.admin_note}`,
          created_at: claim.updated_at || claim.created_at || null,
        },
      ];
    }
    return res.json(payload);
  } catch (error) {
    console.error("CLAIM CHAT GET MESSAGES ERROR:", error);
    return res.status(500).json({
      message: "Failed to fetch claim messages",
    });
  }
};
/* ======================================================
   CLAIM CHAT: POST MESSAGE (PARTICIPANTS)
====================================================== */
const postClaimMessage = async (req, res) => {
  try {
    const claimId = Number(req.params.claimId);
    if (!claimId) {
      return res.status(400).json({
        message: "Invalid claim id",
      });
    }
    const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";
    if (!text) {
      return res.status(400).json({
        message: "Message text is required",
      });
    }
    const claim = await fetchClaimForChat(claimId);
    if (!claim) {
      return res.status(404).json({
        message: "Claim not found",
      });
    }
    if (!isParticipant(req.user, claim)) {
      return res.status(403).json({
        message: "Not authorized to send messages",
      });
    }
    if (req.user.role === "admin") {
      return res.status(403).json({
        message: "Admins can only post system notices",
      });
    }
    const chatStatus = getChatStatus(claim);
    if (!chatStatus.isVerified) {
      return res.status(400).json({
        message: "Chat is available only after verification",
      });
    }
    if (chatStatus.isRejected || chatStatus.isResolved) {
      return res.status(400).json({
        message: "Chat is disabled for this claim",
      });
    }
    if (chatStatus.bothConfirmed) {
      return res.status(400).json({
        message: "Chat is locked after both confirmations",
      });
    }
    const threadData = await ensureThreadForClaim(claim);
    const senderRole = getSenderRole(req.user, claim);
    const message = await Message.create({
      thread_id: threadData.thread.id,
      claim_id: claim.id,
      sender_id: req.user.id,
      sender_role: senderRole,
      type: "user",
      message_text: text,
    });
    return res.status(201).json({
      id: message.id,
      claim_id: claim.id,
      sender_id: req.user.id,
      sender_role: senderRole,
      type: message.type || "user",
      text: message.message_text,
      created_at: message.created_at,
    });
  } catch (error) {
    console.error("CLAIM CHAT POST MESSAGE ERROR:", error);
    return res.status(500).json({
      message: "Failed to send message",
    });
  }
};
module.exports = {
  createClaim,
  getUserClaimsWithMessages,
  getAdminClaimsWithMessages,
  getAdminClaimMessages,
  verifyClaim,
  resolveClaim,
  rejectClaim,
  confirmOwnerReceived,
  confirmFinderReturned,
  getClaimMessages,
  postClaimMessage,
};
