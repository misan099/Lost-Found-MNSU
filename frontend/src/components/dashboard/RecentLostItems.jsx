import { useMemo, useState } from "react";
import LostItemGrid from "../addLostItem/LostItemGrid";
import LostItemDetailsModal from "../addLostItem/LostItemDetailsModal";
import headerStyles from "../addLostItem/LostItemHeader.module.css";
import styles from "./RecentLostItems.module.css";

const toDateKey = (value) => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const matchesFilter = (source, filterValue) => {
  if (!filterValue) return true;
  if (!source) return false;
  return String(source)
    .toLowerCase()
    .includes(String(filterValue).toLowerCase());
};

const getSortValue = (item) => {
  const createdValue = item?.createdAt || item?.created_at || "";
  const createdParsed = createdValue ? new Date(createdValue) : null;
  if (createdParsed && !Number.isNaN(createdParsed.getTime())) {
    return createdParsed.getTime();
  }
  const idValue = Number(item?.id);
  if (!Number.isNaN(idValue)) {
    return idValue;
  }
  const fallbackValue = item?.lostDate || "";
  const fallbackParsed = fallbackValue ? new Date(fallbackValue) : null;
  if (fallbackParsed && !Number.isNaN(fallbackParsed.getTime())) {
    return fallbackParsed.getTime();
  }
  return 0;
};

export default function RecentLostItems({
  items = [],
  loading = false,
  error = "",
  filters = {},
  onRefresh,
}) {
  const [selectedItem, setSelectedItem] = useState(null);
  const recentItems = useMemo(() => {
    const filtered = items.filter((item) => {
      if (!matchesFilter(item.category, filters.category)) {
        return false;
      }
      if (!matchesFilter(item.location, filters.location)) {
        return false;
      }
      if (filters.date && toDateKey(item.lostDate) !== filters.date) {
        return false;
      }
      return true;
    });

    return filtered
      .slice()
      .sort((a, b) => getSortValue(b) - getSortValue(a))
      .slice(0, 3);
  }, [items, filters]);

  return (
    <section className={styles.body} id="lost">
      <div className={styles.heading}>
        <h1 className={headerStyles.title}> Recent Lost Items</h1>
        <p className={headerStyles.subtitle}>
          Items reported as lost by users
        </p>
      </div>

      {loading ? (
        <div className={styles.state}>Loading...</div>
      ) : error ? (
        <div className={styles.state}>{error}</div>
      ) : recentItems.length === 0 ? (
        <div className={styles.state}>No recent lost items yet.</div>
      ) : (
        <LostItemGrid
          items={recentItems}
          loading={false}
          error=""
          onViewDetails={setSelectedItem}
        />
      )}

      <LostItemDetailsModal
        open={!!selectedItem}
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onSuccess={onRefresh}
      />
    </section>
  );
}
