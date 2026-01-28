import api from "../../services/api";

const resolveFileUrl = (url) => {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  const apiBase = api.defaults.baseURL || "";
  const fileBase = apiBase.replace(/\/api\/?$/, "");
  const normalized = url.startsWith("/") ? url : `/${url}`;
  return `${fileBase}${normalized}`;
};

const cleanLabel = (value) => {
  if (!value) return "";
  return String(value).trim();
};

const normalizeStatus = (status) => {
  const normalized = cleanLabel(status).toLowerCase();
  if (normalized.includes("resolved")) return "resolved";
  if (normalized.includes("rejected")) return "rejected";
  if (normalized.includes("awaiting")) return "awaiting_resolution";
  if (normalized.includes("verified")) return "verified";
  if (normalized.includes("pending")) return "pending";
  return normalized || "pending";
};

const formatNepaliDate = (dateString) => {
  if (!dateString) return "-";
  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) return dateString;
  return parsed.toLocaleDateString("en-NP", {
    timeZone: "Asia/Kathmandu",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getResolvedDate = (claim) =>
  claim?.resolvedAt ||
  claim?.resolved_at ||
  claim?.updatedAt ||
  claim?.updated_at ||
  claim?.lastMessageAt ||
  "";

const getResolutionNote = (claim) =>
  claim?.resolutionNote ||
  claim?.resolution_note ||
  claim?.adminNote ||
  "";

const getItemLocation = (item) =>
  cleanLabel(
    item?.location ||
      item?.exactLocation ||
      item?.exact_location ||
      item?.area ||
      ""
  );

const getItemDate = (item) =>
  item?.date ||
  item?.dateLost ||
  item?.date_lost ||
  item?.dateFound ||
  item?.date_found ||
  "";

const getItemDescription = (item) =>
  cleanLabel(
    item?.publicDescription ||
      item?.public_description ||
      item?.description ||
      ""
  );

const mapClaimDetails = (claim) => {
  const rawClaimDetails = claim?.claimDetails || {};
  return {
    text: rawClaimDetails.text ?? claim?.verification_text ?? "",
    type: rawClaimDetails.type ?? claim?.verification_type ?? "",
    additionalContext:
      rawClaimDetails.additionalContext ?? claim?.additional_context ?? "",
    proofImageUrl: resolveFileUrl(
      rawClaimDetails.proofImageUrl ?? claim?.proof_image_url ?? null
    ),
  };
};

const mapItem = ({
  item,
  postedBy,
  claimDetails,
  ownerConfirmed,
  finderConfirmed,
  status,
  type,
}) => ({
  id: item?.id ?? null,
  name: cleanLabel(item?.name || item?.item_name || ""),
  category: cleanLabel(item?.category || ""),
  location: getItemLocation(item),
  date:
    type === "lost"
      ? item?.dateLost || item?.date_lost || getItemDate(item)
      : item?.dateFound || item?.date_found || getItemDate(item),
  description: getItemDescription(item),
  imageUrl: resolveFileUrl(
    item?.imageUrl ||
      item?.image_url ||
      item?.imagePath ||
      item?.image_path ||
      item?.image ||
      null
  ),
  postedBy: cleanLabel(postedBy),
  status,
  claimDetails,
  ownerConfirmed,
  finderConfirmed,
});

const mapResolvedClaim = (claim) => {
  const claimDetails = mapClaimDetails(claim);
  const ownerConfirmed = Boolean(claim?.ownerConfirmed);
  const finderConfirmed = Boolean(claim?.finderConfirmed);
  const lostOwnerName = cleanLabel(
    claim?.lostOwner?.name ||
      claim?.lostOwner?.full_name ||
      claim?.lostItem?.ownerName ||
      ""
  );
  const foundOwnerName = cleanLabel(
    claim?.finder?.name ||
      claim?.foundOwner?.name ||
      claim?.foundOwner?.full_name ||
      claim?.foundItem?.ownerName ||
      ""
  );
  const hasLost = Boolean(claim?.lostItem?.id || claim?.lostItem?.name);
  const hasFound = Boolean(claim?.foundItem?.id || claim?.foundItem?.name);
  const rawClaimType = cleanLabel(claim?.claimType);
  let claimType = rawClaimType.toLowerCase();
  if (claimType.includes("lost")) claimType = "lost";
  if (claimType.includes("found")) claimType = "found";
  if (!claimType) {
    claimType = hasFound ? "found" : "lost";
  }

  const lostItem = mapItem({
    item: claim?.lostItem,
    postedBy: lostOwnerName,
    claimDetails,
    ownerConfirmed,
    finderConfirmed,
    status: "resolved",
    type: "lost",
  });
  const foundItem = mapItem({
    item: claim?.foundItem,
    postedBy: foundOwnerName,
    claimDetails,
    ownerConfirmed,
    finderConfirmed,
    status: "resolved",
    type: "found",
  });

  return {
    id: claim?.id ?? "",
    status: "resolved",
    statusLabel: "Resolved",
    claimType,
    lostItem,
    foundItem,
    lostOwnerName,
    foundOwnerName,
    resolvedAt: getResolvedDate(claim),
    resolutionNote: getResolutionNote(claim),
  };
};

export {
  cleanLabel,
  normalizeStatus,
  formatNepaliDate,
  getResolvedDate,
  getResolutionNote,
  mapResolvedClaim,
};
