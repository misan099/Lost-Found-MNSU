import api from "../../services/api";

export const searchItems = async (query) => {
  const response = await api.get("/search", {
    params: { q: query, limit: 8 },
  });
  return response?.data?.data || response?.data || [];
};
