import api from "../../services/api";

export async function fetchAdminDashboardStats() {
  const adminToken = localStorage.getItem("adminToken");
  const res = await api.get("/admin/dashboard", {
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
  });
  return res.data;
}
