import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated } from "../../utils/auth/authToken";

export default function PrivateRoute() {
  // ❌ If NOT logged in → go to login
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Otherwise allow protected pages
  return <Outlet />;
}
