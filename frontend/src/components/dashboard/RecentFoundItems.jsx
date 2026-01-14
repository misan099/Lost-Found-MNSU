import styles from "./RecentFoundItems.module.css";

export default function RecentFoundItems() {
  return (
    <section className={`${styles.section} container my-5`}>
      <h2 className={styles.title}>Recent Found Items</h2>
      <p className={styles.subtitle}>
        Items that have been found recently
      </p>

      <div className={styles.comingSoon}>
        Coming soon
      </div>
    </section>
  );
}
