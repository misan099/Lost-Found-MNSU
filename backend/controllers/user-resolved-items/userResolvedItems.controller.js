"use strict";

const { Op } = require("sequelize");
const db = require("../../models");

const Claim = db.Claim;
const FoundItem = db.FoundItem;
const LostItem = db.LostItem;
const MessageThread = db.MessageThread;
const Confirmation = db.Confirmation;

const buildFileUrl = (req, url) => {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  if (url.startsWith("/")) return `${baseUrl}${url}`;
  return `${baseUrl}/${url}`;
};

const addTimelineStep = (steps, step, desc, date) => {
  if (!date) return;
  steps.push({ step, desc, date });
};

const buildTimeline = (claim, item) => {
  const steps = [];
  addTimelineStep(
    steps,
    "Item Reported",
    "Item report submitted",
    item?.created_at
  );
  addTimelineStep(
    steps,
    "Claim Submitted",
    "Claim submitted for this item",
    claim?.created_at
  );
  addTimelineStep(
    steps,
    "Chat Enabled",
    "Messaging activated for coordination",
    claim?.thread?.created_at
  );
  const confirmation = claim?.thread?.confirmation;
  if (confirmation?.owner_confirmed && confirmation?.finder_confirmed) {
    addTimelineStep(
      steps,
      "Both Users Confirmed",
      "Exchange successfully completed",
      confirmation?.updated_at || claim?.updated_at
    );
  }
  addTimelineStep(
    steps,
    "Resolved",
    "Item marked as resolved",
    claim?.updated_at
  );
  return steps;
};

/* ======================================================
   GET USER RESOLVED ITEMS
   GET /api/user-resolved-items
====================================================== */
exports.getUserResolvedItems = async (req, res) => {
  try {
    const userId = req.user.id;
    const claims = await Claim.findAll({
      attributes: [
        "id",
        "status",
        "created_at",
        "updated_at",
        "found_item_id",
        "lost_item_id",
        "claimant_user_id",
      ],
      include: [
        {
          model: FoundItem,
          as: "foundItem",
          attributes: [
            "id",
            "item_name",
            "category",
            "location",
            "public_description",
            "date_found",
            "image_url",
            "image_path",
            "status",
            "created_at",
            "user_id",
          ],
        },
        {
          model: LostItem,
          as: "lostItem",
          attributes: [
            "id",
            "item_name",
            "category",
            "location",
            "public_description",
            "description",
            "date_lost",
            "image_url",
            "image_path",
            "status",
            "created_at",
            "user_id",
          ],
        },
        {
          model: MessageThread,
          as: "thread",
          attributes: ["id", "status", "created_at", "updated_at"],
          include: [
            {
              model: Confirmation,
              as: "confirmation",
              attributes: [
                "owner_confirmed",
                "finder_confirmed",
                "updated_at",
              ],
            },
          ],
        },
      ],
      where: {
        status: "resolved",
        [Op.or]: [
          { claimant_user_id: userId },
          { "$foundItem.user_id$": userId },
          { "$lostItem.user_id$": userId },
        ],
      },
      order: [["updated_at", "DESC"]],
      subQuery: false,
    });

    const payload = claims.map((claim) => {
      const isFoundClaim = Boolean(
        claim.found_item_id || claim.foundItem?.id
      );
      const item = isFoundClaim ? claim.foundItem : claim.lostItem;
      const description =
        item?.public_description || item?.description || "";
      const imageUrl = buildFileUrl(
        req,
        item?.image_url || item?.image_path || null
      );
      const confirmation = claim.thread?.confirmation;

      return {
        id: claim.id,
        type: isFoundClaim ? "found" : "lost",
        status: "resolved",
        name: item?.item_name || "Unknown item",
        category: item?.category || "Uncategorized",
        location: item?.location || "Unknown location",
        description,
        imageUrl,
        dateResolved: claim.updated_at || claim.created_at,
        ownerConfirmed: Boolean(confirmation?.owner_confirmed),
        finderConfirmed: Boolean(confirmation?.finder_confirmed),
        timeline: buildTimeline(claim, item),
      };
    });

    return res.status(200).json({
      success: true,
      data: payload,
    });
  } catch (error) {
    console.error("USER RESOLVED ITEMS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch resolved items",
    });
  }
};
