import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../../components/admin/AdminLayout";
import ResolvedItemsHeader from "../../../components/admin/resolved-items/ResolvedItemsHeader";
import ResolvedItemsFilters from "../../../components/admin/resolved-items/ResolvedItemsFilters";
import ResolvedItemsTable from "../../../components/admin/resolved-items/ResolvedItemsTable";
import ResolvedItemViewModal from "../../../components/admin/resolved-items/ResolvedItemViewModal";
import ResolvedSummaryModal from "../../../components/admin/resolved-items/ResolvedSummaryModal";
import useResolvedClaims from "../../../hooks/resolved-items/useResolvedClaims";
import styles from "./ResolvedItems.module.css";

const getDateValue = (value) => {
  if (!value) return 0;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 0;
  return parsed.getTime();
};

export default function AdminResolvedItems() {
  const navigate = useNavigate();
  const { resolvedClaims, loading, errorMessage } = useResolvedClaims();
  const [filterValue, setFilterValue] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewModal, setViewModal] = useState(null);
  const [summaryModal, setSummaryModal] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("isAdmin");

    navigate("/admin/login", { replace: true });
  };

  const filteredClaims = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    return resolvedClaims
      .filter((claim) => {
        if (filterValue === "recent") {
          const resolvedTime = getDateValue(claim.resolvedAt);
          if (!resolvedTime || resolvedTime < sevenDaysAgo) {
            return false;
          }
        }

        if (!normalizedSearch) return true;

        const haystack = [
          claim?.id,
          claim?.lostItem?.name,
          claim?.foundItem?.name,
          claim?.lostOwnerName,
          claim?.foundOwnerName,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(normalizedSearch);
      })
      .sort((a, b) => {
        const dateDelta =
          getDateValue(b.resolvedAt) - getDateValue(a.resolvedAt);
        if (dateDelta !== 0) return dateDelta;
        return Number(b.id || 0) - Number(a.id || 0);
      });
  }, [resolvedClaims, filterValue, searchTerm]);

  const handleViewItem = (claim, type) => {
    if (!type) return;
    const item = type === "lost" ? claim.lostItem : claim.foundItem;
    setViewModal({ item, type });
  };

  return (
    <AdminLayout onLogout={handleLogout}>
      <div className={styles.pageWrapper}>
        <div className={styles.container}>
          <ResolvedItemsHeader />

          <ResolvedItemsFilters
            filterValue={filterValue}
            onFilterChange={setFilterValue}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />

          {errorMessage && (
            <div className={styles.errorMessage}>{errorMessage}</div>
          )}

          {!errorMessage && (
            <ResolvedItemsTable
              items={filteredClaims}
              loading={loading}
              onViewItem={handleViewItem}
              onViewSummary={setSummaryModal}
            />
          )}
        </div>
      </div>

      {viewModal && (
        <ResolvedItemViewModal
          item={viewModal.item}
          type={viewModal.type}
          onClose={() => setViewModal(null)}
        />
      )}

      {summaryModal && (
        <ResolvedSummaryModal
          claim={summaryModal}
          onClose={() => setSummaryModal(null)}
        />
      )}
    </AdminLayout>
  );
}
