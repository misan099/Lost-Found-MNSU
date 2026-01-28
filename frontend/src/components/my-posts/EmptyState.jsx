import styles from "./MyPosts.module.css";

export default function EmptyState() {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>No Posts</div>
      <h2 className={styles.emptyTitle}>
        You haven't posted any items yet.
      </h2>
      <p className={styles.emptyText}>
        Start by reporting a lost or found item to help reunite items with their
        owners.
      </p>
    </div>
  );
}
