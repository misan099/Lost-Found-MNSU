import { useState, useEffect } from "react";
import api from "../../services/api";

const RecentFoundItems = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchRecentItems = async () => {
      try {
        const response = await api.get("/found-items/recent");
        setItems(response.data);
      } catch (error) {
        console.error("Failed to fetch recent found items:", error);
      }
    };

    fetchRecentItems();
  }, []);

  return (
    <div>
      <h2>Recent Found Items</h2>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            {item.item_name} – {item.category}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentFoundItems;
