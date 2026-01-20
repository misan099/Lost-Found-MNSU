import styles from "./AdminDashboard.module.css";
import { useLocation, useNavigate } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

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
        <Stat label="Total Users" value="1,247" />
        <Stat label="Total Lost Items" value="385" />
        <Stat label="Total Found Items" value="412" />
        <Stat label="Active Claims" value="27" />
        <Stat label="Pending Verifications" value="14" pending />
        <Stat label="Resolved Items" value="289" />
      </section>

      {/* ATTENTION */}
      <section className={styles.attentionSection}>
        <h3 className={styles.attentionTitle}>
          Requires Admin Attention
        </h3>

        <div className={styles.attentionItem}>
          <span className={styles.attentionText}>
            Pending Claim Verifications
          </span>
          <span className={styles.attentionBadge}>15</span>
        </div>

        <div className={styles.attentionItem}>
          <span className={styles.attentionText}>
            Items Awaiting Confirmation
          </span>
          <span className={styles.attentionBadge}>8</span>
        </div>
      </section>
    </AdminLayout>
  );
}

/* ================= STAT CARD ================= */
function Stat({ label, value, pending }) {
  return (
    <div
      className={`${styles.statCard} ${
        pending ? styles.pending : ""
      }`}
    >
      <div className={styles.statLabel}>{label}</div>
      <div className={styles.statNumber}>{value}</div>
    </div>
  );
}
