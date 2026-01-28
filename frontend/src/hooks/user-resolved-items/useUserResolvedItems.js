import { useCallback, useEffect, useState } from "react";
import { getUserResolvedItems } from "../../services/userResolvedItemsApi";

export default function useUserResolvedItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const data = await getUserResolvedItems();
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      setErrorMessage("Unable to load resolved items.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return { items, loading, errorMessage, refresh: fetchItems };
}
