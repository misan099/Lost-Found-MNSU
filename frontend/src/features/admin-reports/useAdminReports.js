import { useCallback, useEffect, useState } from "react";
import { fetchAdminReports } from "./adminReportsApi";

export default function useAdminReports() {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadReports = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const data = await fetchAdminReports();
      setReports(data);
    } catch (error) {
      setErrorMessage("Unable to load reports.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  return {
    reports,
    loading,
    errorMessage,
    refresh: loadReports,
  };
}
