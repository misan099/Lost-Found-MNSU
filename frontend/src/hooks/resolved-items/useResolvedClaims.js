import { useCallback, useEffect, useState } from "react";
import api from "../../services/api";
import {
  mapResolvedClaim,
  normalizeStatus,
} from "../../utils/resolved-items/resolvedItemsUtils";

export default function useResolvedClaims() {
  const [resolvedClaims, setResolvedClaims] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadResolvedClaims = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const adminToken = localStorage.getItem("adminToken");
      const response = await api.get("/admin/claims/with-messages", {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      const data = Array.isArray(response.data) ? response.data : [];
      const resolved = data
        .filter((claim) => normalizeStatus(claim?.status) === "resolved")
        .map(mapResolvedClaim);

      setResolvedClaims(resolved);
    } catch (error) {
      setErrorMessage("Unable to load resolved items.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadResolvedClaims();
  }, [loadResolvedClaims]);

  return {
    resolvedClaims,
    loading,
    errorMessage,
    reload: loadResolvedClaims,
  };
}
