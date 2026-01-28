import { useMemo, useState } from "react";

import LayoutNoFooter from "../../../components/layout/LayoutNoFooter";
import ResolvedItemsHeader from "../../../components/user-resolved-items/ResolvedItemsHeader";
import ResolvedItemsGrid from "../../../components/user-resolved-items/ResolvedItemsGrid";
import ResolvedItemsEmpty from "../../../components/user-resolved-items/ResolvedItemsEmpty";
import ResolvedItemModal from "../../../components/user-resolved-items/ResolvedItemModal";
import useUserResolvedItems from "../../../hooks/user-resolved-items/useUserResolvedItems";
import styles from "./ResolvedItems.module.css";

const formatDate = (value) => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-NP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function ResolvedItems() {
  const { items, loading, errorMessage } = useUserResolvedItems();
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedItem, setSelectedItem] = useState(null);

  const filteredItems = useMemo(() => {
    if (activeFilter === "all") return items;
    return items.filter((item) => item.type === activeFilter);
  }, [items, activeFilter]);

  return (
    <LayoutNoFooter>
      <ResolvedItemsHeader
        title="Resolved Items"
        subtitle="Items successfully returned to their owners"
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      <main className={styles.mainContent}>
        {loading ? (
          <div className={styles.emptyState}>Loading resolved items...</div>
        ) : errorMessage ? (
          <div className={styles.emptyState}>{errorMessage}</div>
        ) : filteredItems.length === 0 ? (
          <ResolvedItemsEmpty
            title="No items have been resolved yet."
            text="Resolved items will appear here once exchanges are completed."
          />
        ) : (
          <ResolvedItemsGrid
            items={filteredItems}
            onSelect={setSelectedItem}
            formatDate={formatDate}
          />
        )}
      </main>

      <ResolvedItemModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        formatDate={formatDate}
      />
    </LayoutNoFooter>
  );
}
