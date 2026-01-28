import api from "../../services/api";

export async function fetchAdminReports() {
  const adminToken = localStorage.getItem("adminToken");
  const res = await api.get("/admin/reports", {
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
  });
  return res.data;
}
