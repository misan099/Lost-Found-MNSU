import styles from "../AdminLostItems.module.css";

export default function LostItemsFilters({
  statusFilter,
  onStatusChange,
  categoryFilter,
  onCategoryChange,
  categories,
  searchTerm,
  onSearchChange,
}) {
  return (
    <section className={styles.filtersSection}>
      <div className={styles.filterGroup}>
        <label className={styles.filterLabel} htmlFor="statusFilter">
          Status
        </label>
        <select
          id="statusFilter"
          className={styles.filterSelect}
          value={statusFilter}
          onChange={(event) => onStatusChange(event.target.value)}
        >
          <option value="all">All</option>
          <option value="available">Available</option>
          <option value="claim-requested">Claim Requested</option>
          <option value="verified">Verified</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      <div className={styles.filterGroup}>
        <label className={styles.filterLabel} htmlFor="categoryFilter">
          Category
        </label>
        <select
          id="categoryFilter"
          className={styles.filterSelect}
          value={categoryFilter}
          onChange={(event) => onCategoryChange(event.target.value)}
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category === "all" ? "All Categories" : category}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.filterSearch}>
        <input
          type="text"
          placeholder="Search by item name or location..."
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>
    </section>
  );
}
