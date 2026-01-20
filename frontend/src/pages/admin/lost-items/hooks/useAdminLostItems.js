import { useCallback, useEffect, useState } from "react";

import api from "../../../../services/api";
import {
  normalizeStatus,
  resolveFileUrl,
} from "../utils/lostItemUtils";

export default function useAdminLostItems() {
  const [items, setItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const adminToken = localStorage.getItem("adminToken");
      const headers = adminToken
        ? { Authorization: `Bearer ${adminToken}` }
        : undefined;
      const [itemsResponse, claimsResponse] = await Promise.all([
        api.get("/lost-items", { headers }),
        api.get("/admin/claims/with-messages", { headers }),
      ]);

      const rawItems = Array.isArray(itemsResponse.data)
        ? itemsResponse.data
        : itemsResponse.data?.items ||
          itemsResponse.data?.lostItems ||
          itemsResponse.data?.data ||
          [];
      const normalizedItems = rawItems.map((item) => ({
        id: item.id,
        name: item.item_name || item.name || "Unnamed item",
        category: item.category || "Other",
        location:
          item.location ||
          item.exact_location ||
          item.area ||
          "Unknown",
        dateLost: item.date_lost || item.dateLost || "",
        postedBy:
          item.user?.name ||
          item.user?.username ||
          item.user_id ||
          "Unknown",
        status: normalizeStatus(item.status),
        description:
          item.public_description || item.description || "",
        imageUrl: resolveFileUrl(
          item.image_url ||
            item.image_path ||
            item.imageUrl ||
            item.imagePath ||
            item.image ||
            null
        ),
        raw: item,
      }));

      const rawClaims = Array.isArray(claimsResponse.data)
        ? claimsResponse.data
        : [];
      setItems(normalizedItems);
      setClaims(rawClaims);
    } catch (error) {
      setErrorMessage("Unable to load lost items.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    items,
    claims,
    loading,
    errorMessage,
    reload: loadData,
  };
}
