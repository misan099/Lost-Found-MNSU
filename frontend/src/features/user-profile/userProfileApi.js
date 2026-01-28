import api from "../../services/api";

export async function fetchUserProfile() {
  const res = await api.get("/user-profile/me");
  return res.data;
}

export async function updateUserProfile(payload) {
  const res = await api.patch("/user-profile/me", payload);
  return res.data;
}
