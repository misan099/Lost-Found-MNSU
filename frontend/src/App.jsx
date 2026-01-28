import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// ===============================
// AUTH PAGES (USER + ADMIN)
// ===============================
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";

// ===============================
// ROUTE GUARDS
// ===============================
import PrivateRoute from "./routes/private/PrivateRoute";
import PublicRoute from "./routes/public/PublicRoute";
import AdminRoute from "./routes/private/AdminRoute";

// ===============================
// DASHBOARDS
// ===============================
import Dashboard from "./pages/dashboard/Dashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminClaims from "./pages/admin/AdminClaims";
import AdminResolvedItems from "./pages/admin/resolved-items/AdminResolvedItems";
import AdminFoundItems from "./pages/admin/AdminFoundItems";
import AdminMessages from "./pages/admin/AdminMessages";
import AdminLostItems from "./pages/admin/lost-items/AdminLostItems";
import AdminUsers from "./pages/admin/users/AdminUsers";
import FoundItemsPage from "./pages/found/FoundItemPage";
import LostItemsPage from "./pages/lost/LostItemPage";
import ClaimChat from "./pages/user/ClaimChat";
import MyPosts from "./pages/user/MyPosts";
import ResolvedItems from "./pages/user/resolved-items/ResolvedItems";
import AdminReports from "./pages/admin/reports/AdminReports";

function App() {
  return (
    <Router>
      <Routes>

        {/* ===============================
            PUBLIC ROUTES
            (ONLY WHEN NOT LOGGED IN)
        ================================ */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        {/* ===============================
            USER ROUTES
            (LOGGED-IN NORMAL USERS)
        ================================ */}
        <Route element={<PrivateRoute />}>
          {/* Default home */}
          <Route path="/" element={<Dashboard />} />

          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/found" element={<FoundItemsPage />} />
          <Route path="/lost" element={<LostItemsPage />} />
          <Route path="/messages" element={<ClaimChat />} />
          <Route path="/my-posts" element={<MyPosts />} />
          <Route path="/resolved-items" element={<ResolvedItems />} />
        </Route>

        {/* ===============================
            ADMIN ROUTES
            (LOGGED-IN + ADMIN ROLE)
        ================================ */}
        <Route element={<AdminRoute />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/lost-items" element={<AdminLostItems />} />
          <Route path="/admin/found-items" element={<AdminFoundItems />} />
          <Route path="/admin/claims" element={<AdminClaims />} />
          <Route path="/admin/messages" element={<AdminMessages />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/resolved" element={<AdminResolvedItems />} />
          <Route path="/admin/reports" element={<AdminReports />} />
        </Route>

        {/* ===============================
            FALLBACK (404)
            Redirect to login
        ================================ */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </Router>
  );
}

export default App;
