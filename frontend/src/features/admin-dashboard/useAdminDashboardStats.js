import { useCallback, useEffect, useState } from "react";
import { fetchAdminDashboardStats } from "./adminDashboardApi";

export default function useAdminDashboardStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const data = await fetchAdminDashboardStats();
      setStats(data);
    } catch (error) {
      setErrorMessage("Unable to load dashboard stats.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    stats,
    loading,
    errorMessage,
    refresh: loadStats,
  };
}
