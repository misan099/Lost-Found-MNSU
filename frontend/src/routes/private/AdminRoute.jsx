import { Navigate, Outlet } from "react-router-dom";
import { getToken, getUser } from "../../utils/auth/authToken";

export default function AdminRoute() {
  const token = getToken();
  const user = getUser();

  // ❌ Not logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // ❌ Logged in but NOT admin
  if (user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  // ✅ Admin allowed
  return <Outlet />;
}
