import { useCallback, useEffect, useState } from "react";
import { fetchAdminNotifications } from "./adminNotificationsApi";

export default function useAdminNotifications() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const response = await fetchAdminNotifications();
      setData(response);
    } catch (error) {
      setErrorMessage("Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  return {
    data,
    loading,
    errorMessage,
    refresh: loadNotifications,
  };
}
