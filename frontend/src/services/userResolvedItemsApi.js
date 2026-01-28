import api from "./api";

export const getUserResolvedItems = async () => {
  const response = await api.get("/user-resolved-items");
  return response?.data?.data || response?.data || [];
};
