import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated } from "../../utils/auth/authToken";

export default function PublicRoute() {
  // ❌ If already logged in → go to dashboard
  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }

  // ✅ Otherwise allow login/signup
  return <Outlet />;
}
