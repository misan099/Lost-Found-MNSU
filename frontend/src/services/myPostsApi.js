import api from "./api";

const normalizeResponse = (response) =>
  response?.data?.data || response?.data || [];

export const getMyLostItems = async () => {
  const response = await api.get("/user-posts/lost");
  return normalizeResponse(response);
};

export const getMyFoundItems = async () => {
  const response = await api.get("/user-posts/found");
  return normalizeResponse(response);
};

export const updateMyLostItem = async (id, payload) => {
  const response = await api.patch(`/user-posts/lost/${id}`, payload);
  return response.data;
};

export const updateMyFoundItem = async (id, payload) => {
  const response = await api.patch(`/user-posts/found/${id}`, payload);
  return response.data;
};

export const deleteMyLostItem = async (id) => {
  const response = await api.delete(`/user-posts/lost/${id}`);
  return response.data;
};

export const deleteMyFoundItem = async (id) => {
  const response = await api.delete(`/user-posts/found/${id}`);
  return response.data;
};
