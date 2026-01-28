import styles from "../../../pages/admin/resolved-items/ResolvedItems.module.css";

export default function ResolvedItemsHeader() {
  return (
    <header className={styles.pageHeader}>
      <h1 className={styles.pageTitle}>Resolved Items</h1>
      <p className={styles.subtitle}>
        Successfully completed lost and found cases
      </p>
    </header>
  );
}
