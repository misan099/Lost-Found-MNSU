import AdminLayout from "../../../components/admin/AdminLayout";
import useAdminReports from "../../../features/admin-reports/useAdminReports";
import styles from "./AdminReports.module.css";

const formatValue = (value) => Number(value || 0).toLocaleString();

export default function AdminReports() {
  const { reports, loading, errorMessage, refresh } = useAdminReports();

  const totals = reports?.totals || {};
  const items = reports?.items || {};
  const claims = reports?.claims || {};
  const users = reports?.users || {};

  const itemReports = [
    { label: "Total Lost Items", value: items.lost },
    { label: "Total Found Items", value: items.found },
    { label: "Total Resolved Items", value: items.resolved },
  ];

  const claimReports = [
    { label: "Pending Claims", value: claims.pending },
    { label: "Verified Claims", value: claims.verified },
    { label: "Rejected Claims", value: claims.rejected },
  ];

  const userReports = [
    { label: "Active Users", value: users.active },
    { label: "Suspended Users", value: users.suspended },
    { label: "Blocked Users", value: users.blocked },
  ];

  return (
    <AdminLayout>
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Reports</h1>
            <p className={styles.subtitle}>
              Live totals across users, items, and claims.
            </p>
          </div>
          <button
            type="button"
            className={styles.refreshButton}
            onClick={refresh}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </header>

        {errorMessage && (
          <div className={styles.errorMessage}>{errorMessage}</div>
        )}

        <div className={styles.summaryCards}>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Total Users</div>
            <div className={styles.cardValue}>
              {formatValue(totals.users)}
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Total Lost Items</div>
            <div className={styles.cardValue}>
              {formatValue(totals.lost)}
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Total Found Items</div>
            <div className={styles.cardValue}>
              {formatValue(totals.found)}
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Total Claims</div>
            <div className={styles.cardValue}>
              {formatValue(totals.claims)}
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Total Resolved</div>
            <div className={styles.cardValue}>
              {formatValue(totals.resolved)}
            </div>
          </div>
        </div>

        <section className={styles.reportsSection}>
          <h2 className={styles.sectionTitle}>Item Reports</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Category</th>
                <th className={styles.countHeader}>Count</th>
              </tr>
            </thead>
            <tbody>
              {itemReports.map((row) => (
                <tr key={row.label}>
                  <td>{row.label}</td>
                  <td className={styles.countCell}>
                    {formatValue(row.value)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className={styles.reportsSection}>
          <h2 className={styles.sectionTitle}>Claim Reports</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Category</th>
                <th className={styles.countHeader}>Count</th>
              </tr>
            </thead>
            <tbody>
              {claimReports.map((row) => (
                <tr key={row.label}>
                  <td>{row.label}</td>
                  <td className={styles.countCell}>
                    {formatValue(row.value)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className={styles.reportsSection}>
          <h2 className={styles.sectionTitle}>User Reports</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Category</th>
                <th className={styles.countHeader}>Count</th>
              </tr>
            </thead>
            <tbody>
              {userReports.map((row) => (
                <tr key={row.label}>
                  <td>{row.label}</td>
                  <td className={styles.countCell}>
                    {formatValue(row.value)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </AdminLayout>
  );
}
