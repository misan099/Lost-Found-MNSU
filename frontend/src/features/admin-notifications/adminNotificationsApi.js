import api from "../../services/api";

export async function fetchAdminNotifications() {
  const adminToken = localStorage.getItem("adminToken");
  const res = await api.get("/admin/notifications", {
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
  });
  return res.data;
}
