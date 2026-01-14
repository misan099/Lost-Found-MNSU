import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// AUTH PAGES
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword"; // 👈 ADD THIS


// ROUTE GUARDS
import PrivateRoute from "./routes/private/PrivateRoute";
import PublicRoute from "./routes/public/PublicRoute";
import AdminRoute from "./routes/private/AdminRoute";

// DASHBOARDS
import Dashboard from "./pages/dashboard/Dashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";

function App() {
  return (
    <Router>
      <Routes>

        {/* DEFAULT */}
        <Route path="/" element={<Navigate to="/login" replace />} />

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
            (LOGGED IN USERS)
        ================================ */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

        {/* ===============================
            ADMIN ROUTES
            (LOGGED IN + ADMIN)
        ================================ */}
        <Route element={<AdminRoute />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </Router>
  );
}

export default App;
