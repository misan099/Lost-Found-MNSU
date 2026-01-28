import { useCallback, useEffect, useState } from "react";

import api from "../../../services/api";

const normalizeStatus = (statusValue) => {
  if (!statusValue) return "";
  const normalized = String(statusValue).toLowerCase().replace(/_/g, " ").trim();
  if (normalized === "available") return "Available";
  if (normalized === "claim requested") return "Claim Requested";
  if (normalized === "matched") return "Claim Requested";
  if (normalized === "verified") return "Verified";
  if (normalized === "returned") return "Returned";
  return statusValue;
};

const normalizeLostItems = (payload) => {
  const rawItems = Array.isArray(payload)
    ? payload
    : payload?.items || payload?.lostItems || payload?.data || [];
  const apiBase = api.defaults.baseURL || "";
  const fileBase = apiBase.replace(/\/api\/?$/, "");

  return rawItems.map((item) => {
    const hasVerifiedClaim = Boolean(item?.hasVerifiedClaim);
    const statusLabel = hasVerifiedClaim
      ? "Verified"
      : normalizeStatus(item.status);

    return {
      id: item.id || item._id,
      title: item.item_name || item.title || "",
      category: item.category || "",
      location: item.area || item.location || "",
      lostDate: item.date_lost || item.lostDate || "",
      hasVerifiedClaim,
      image: (() => {
        const imagePath =
          item.image ||
          item.image_url ||
          item.imageUrl ||
          item.image_path ||
          null;
        if (!imagePath) return null;
        if (typeof imagePath === "string" && imagePath.startsWith("http")) {
          return imagePath;
        }
        return `${fileBase}${imagePath}`;
      })(),
      description: item.public_description || item.description || "",
      status: statusLabel,
    };
  });
};

export default function useLostItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLostItems = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/lost-items");
      setItems(normalizeLostItems(response.data));
    } catch (err) {
      setError("Failed to load lost items.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLostItems();
  }, [fetchLostItems]);

  return {
    items,
    loading,
    error,
    fetchLostItems,
  };
}
