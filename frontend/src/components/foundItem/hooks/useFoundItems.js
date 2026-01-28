import { useCallback, useEffect, useState } from "react";

import api from "../../../services/api";

const normalizeStatus = (statusValue) => {
  if (!statusValue) return "";
  const normalized = String(statusValue).toLowerCase().replace(/_/g, " ").trim();
  if (normalized === "available") return "Available";
  if (normalized === "claim requested") return "Claim Requested";
  if (normalized === "verified") return "Verified";
  if (normalized === "returned") return "Returned";
  return statusValue;
};

const normalizeFoundItems = (payload) => {
  const rawItems = Array.isArray(payload)
    ? payload
    : payload?.items || payload?.foundItems || [];
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
      foundDate: item.date_found || item.foundDate || "",
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
      status: statusLabel,
      description: item.public_description || item.description || "",
    };
  });
};

export default function useFoundItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchFoundItems = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/found-items");
      setItems(normalizeFoundItems(response.data));
    } catch (err) {
      setError("Failed to load found items.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFoundItems();
  }, [fetchFoundItems]);

  return {
    items,
    loading,
    error,
    fetchFoundItems,
  };
}
