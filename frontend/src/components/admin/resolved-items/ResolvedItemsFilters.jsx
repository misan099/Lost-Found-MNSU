import styles from "../../../pages/admin/resolved-items/ResolvedItems.module.css";

export default function ResolvedItemsFilters({
  filterValue,
  onFilterChange,
  searchTerm,
  onSearchChange,
}) {
  return (
    <section className={styles.controlsSection}>
      <div className={styles.controlGroup}>
        <label className={styles.controlLabel} htmlFor="resolvedFilter">
          Filter
        </label>
        <select
          id="resolvedFilter"
          className={styles.controlInput}
          value={filterValue}
          onChange={(event) => onFilterChange(event.target.value)}
        >
          <option value="all">All Resolved</option>
          <option value="recent">Recently Resolved (Last 7 Days)</option>
        </select>
      </div>
      <div className={styles.controlGroup}>
        <label className={styles.controlLabel} htmlFor="resolvedSearch">
          Search
        </label>
        <input
          id="resolvedSearch"
          type="text"
          className={styles.controlInput}
          placeholder="Search by item name or owner..."
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>
    </section>
  );
}
