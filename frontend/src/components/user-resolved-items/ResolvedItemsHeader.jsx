import styles from "../../pages/user/resolved-items/ResolvedItems.module.css";

export default function ResolvedItemsHeader({
  title,
  subtitle,
  activeFilter,
  onFilterChange,
}) {
  return (
    <div className={styles.pageHeader}>
      <div className={styles.pageHeaderLeft}>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <div className={styles.filterTabs}>
        {["all", "lost", "found"].map((filter) => (
          <button
            key={filter}
            type="button"
            className={`${styles.filterTab} ${
              activeFilter === filter ? styles.filterTabActive : ""
            }`}
            onClick={() => onFilterChange(filter)}
          >
            {filter === "all"
              ? "All"
              : filter === "lost"
                ? "Lost"
                : "Found"}
          </button>
        ))}
      </div>
    </div>
  );
}
