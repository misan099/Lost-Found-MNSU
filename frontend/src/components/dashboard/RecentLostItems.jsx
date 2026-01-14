import styles from "./RecentLostItems.module.css";

export default function RecentLostItems() {
  return (
    <section className={`${styles.section} container my-5`}>
      <h2 className={styles.title}>Recent Lost Items</h2>
      <p className={styles.subtitle}>
        Items reported as lost recently
      </p>

      <div className={styles.comingSoon}>
        Coming soon
      </div>
    </section>
  );
}
