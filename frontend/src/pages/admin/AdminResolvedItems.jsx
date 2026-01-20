import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../services/api";
import styles from "./AdminResolvedItems.module.css";
import AdminLayout from "../../components/admin/AdminLayout";

const getResolvedDate = (claim) =>
  claim?.resolvedAt ||
  claim?.resolved_at ||
  claim?.updatedAt ||
  claim?.updated_at ||
  claim?.lastMessageAt ||
  "";

const getResolutionNote = (claim) =>
  claim?.resolutionNote || claim?.resolution_note || claim?.adminNote || "";

export default function AdminResolvedItems() {
  const navigate = useNavigate();
  const location = useLocation();
  const [resolvedClaims, setResolvedClaims] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("isAdmin");

    navigate("/admin/login", { replace: true });
  };

  useEffect(() => {
    let isMounted = true;

    const fetchResolvedClaims = async () => {
      setLoading(true);
      setErrorMessage("");
      try {
        const adminToken = localStorage.getItem("adminToken");
        const response = await api.get("/admin/claims/with-messages", {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        });

        const data = Array.isArray(response.data)
          ? response.data
          : [];
        const resolved = data.filter(
          (claim) => claim.status === "Resolved"
        );

        if (isMounted) {
          setResolvedClaims(resolved);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage("Unable to load resolved items.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchResolvedClaims();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <AdminLayout
      currentPath={location.pathname}
      onNavigate={navigate}
      onLogout={handleLogout}
    >
      <div className={styles.pageWrapper}>
        <h1 className={styles.pageTitle}>Resolved Items</h1>
        <p className={styles.pageSubtitle}>
          Read-only view of claims finalized after user confirmation.
        </p>

        {errorMessage && (
          <p className={styles.errorMessage}>{errorMessage}</p>
        )}

        {loading ? (
          <p className={styles.mutedText}>Loading resolved items...</p>
        ) : resolvedClaims.length === 0 ? (
          <p className={styles.mutedText}>No resolved items yet</p>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.tableHeader}>Claim ID</th>
                  <th className={styles.tableHeader}>Lost Item Name</th>
                  <th className={styles.tableHeader}>Found Item Name</th>
                  <th className={styles.tableHeader}>Lost Owner</th>
                  <th className={styles.tableHeader}>Found Owner</th>
                  <th className={styles.tableHeader}>Resolved Date</th>
                  <th className={styles.tableHeader}>Resolution Note</th>
                </tr>
              </thead>
              <tbody>
                {resolvedClaims.map((claim) => {
                  const resolvedDate = getResolvedDate(claim);
                  const resolutionNote = getResolutionNote(claim);
                  return (
                    <tr key={claim.id} className={styles.tableRow}>
                      <td className={styles.tableCell}>{claim.id}</td>
                      <td className={styles.tableCell}>
                        {claim.lostItem?.name || "Unknown"}
                      </td>
                      <td className={styles.tableCell}>
                        {claim.foundItem?.name || "Unknown"}
                      </td>
                      <td className={styles.tableCell}>
                        {claim.lostOwner?.name || "Unknown"}
                      </td>
                      <td className={styles.tableCell}>
                        {claim.finder?.name || "Unknown"}
                      </td>
                      <td className={styles.tableCell}>
                        {resolvedDate || "Unknown"}
                      </td>
                      <td className={styles.tableCell}>
                        {resolutionNote || "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
