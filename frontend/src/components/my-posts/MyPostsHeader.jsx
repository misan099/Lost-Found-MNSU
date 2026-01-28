import styles from "./MyPosts.module.css";

export default function MyPostsHeader({
  activeFilter,
  onFilterChange,
  title,
  subtitle,
}) {
  const filters = [
    { key: "all", label: "All" },
    { key: "lost", label: "Lost" },
    { key: "found", label: "Found" },
  ];

  return (
    <div className={styles.pageHeader}>
      <div className={styles.pageHeaderLeft}>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <div className={styles.filterTabs}>
        {filters.map((filter) => (
          <button
            key={filter.key}
            type="button"
            className={`${styles.filterTab} ${
              activeFilter === filter.key ? styles.filterTabActive : ""
            }`}
            onClick={() => onFilterChange(filter.key)}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
}
