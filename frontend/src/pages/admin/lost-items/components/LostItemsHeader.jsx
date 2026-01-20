import styles from "../AdminLostItems.module.css";

export default function LostItemsHeader() {
  return (
    <header className={styles.pageHeader}>
      <h1 className={styles.pageTitle}>Manage Lost Items</h1>
      <p className={styles.pageSubtitle}>
        Review lost item reports and track claim progress.
      </p>
    </header>
  );
}
