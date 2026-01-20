import api from "../../../../services/api";

export const resolveFileUrl = (url) => {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  const apiBase = api.defaults.baseURL || "";
  const fileBase = apiBase.replace(/\/api\/?$/, "");
  const normalized = url.startsWith("/") ? url : `/${url}`;
  return `${fileBase}${normalized}`;
};

export const formatNepaliDate = (dateString) => {
  if (!dateString) return "-";
  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) return dateString;
  return parsed.toLocaleString("en-NP", {
    timeZone: "Asia/Kathmandu",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const normalizeStatus = (statusValue) => {
  if (!statusValue) return "available";
  const normalized = String(statusValue)
    .toLowerCase()
    .replace(/_/g, "-")
    .replace(/\s+/g, "-")
    .trim();
  if (normalized === "pending") return "available";
  if (normalized === "matched") return "claim-requested";
  if (normalized === "claim-requested") return "claim-requested";
  if (normalized === "verified") return "verified";
  if (normalized === "resolved") return "resolved";
  return normalized;
};

export const mapClaimStatus = (statusValue) => {
  if (!statusValue) return "";
  if (statusValue === "Pending Verification") return "claim-requested";
  if (
    statusValue === "Matched" ||
    statusValue === "Verified" ||
    statusValue === "Awaiting Confirmation" ||
    statusValue === "Awaiting Resolution"
  ) {
    return "verified";
  }
  if (statusValue === "Resolved") return "resolved";
  return "";
};

export const formatStatusLabel = (status) => {
  if (status === "claim-requested") return "Claim Requested";
  if (status === "verified") return "Verified";
  if (status === "resolved") return "Resolved";
  return "Available";
};
