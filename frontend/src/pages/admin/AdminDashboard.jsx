import styles from "./AdminDashboard.module.css";
import { useLocation, useNavigate } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import useAdminDashboardStats from "../../features/admin-dashboard/useAdminDashboardStats";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { stats, loading, errorMessage } = useAdminDashboardStats();

  const totals = stats?.totals || {};
  const claims = stats?.claims || {};
  const formatValue = (value) => Number(value || 0).toLocaleString();

  // ✅ LOGOUT HANDLER
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("isAdmin");

    navigate("/admin/login", { replace: true });
  };

  return (
    <AdminLayout
      currentPath={location.pathname}
      onNavigate={navigate}
      onLogout={handleLogout}
    >
      {/* STATS */}
      <section className={styles.statsGrid}>
        <Stat
          label="Total Users"
          value={formatValue(totals.users)}
          muted={loading}
        />
        <Stat
          label="Total Lost Items"
          value={formatValue(totals.lost)}
          muted={loading}
        />
        <Stat
          label="Total Found Items"
          value={formatValue(totals.found)}
          muted={loading}
        />
        <Stat
          label="Active Claims"
          value={formatValue(claims.active)}
          muted={loading}
        />
        <Stat
          label="Pending Verifications"
          value={formatValue(claims.pending)}
          pending
          muted={loading}
        />
        <Stat
          label="Resolved Items"
          value={formatValue(totals.resolved)}
          muted={loading}
        />
      </section>

      {errorMessage && (
        <div className={styles.errorMessage}>{errorMessage}</div>
      )}

      {/* ATTENTION */}
      <section className={styles.attentionSection}>
        <h3 className={styles.attentionTitle}>
          Requires Admin Attention
        </h3>

        <div className={styles.attentionItem}>
          <span className={styles.attentionText}>
            Pending Claim Verifications
          </span>
          <span className={styles.attentionBadge}>
            {formatValue(claims.pending)}
          </span>
        </div>

        <div className={styles.attentionItem}>
          <span className={styles.attentionText}>
            Items Awaiting Confirmation
          </span>
          <span className={styles.attentionBadge}>
            {formatValue(claims.awaitingResolution)}
          </span>
        </div>
      </section>
    </AdminLayout>
  );
}

/* ================= STAT CARD ================= */
function Stat({ label, value, pending, muted }) {
  return (
    <div
      className={`${styles.statCard} ${
        pending ? styles.pending : ""
      }`}
    >
      <div className={styles.statLabel}>{label}</div>
      <div
        className={`${styles.statNumber} ${
          muted ? styles.statMuted : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}
