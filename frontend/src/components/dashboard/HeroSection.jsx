import styles from "./HeroSection.module.css";

export default function HeroSection({
  onReportFoundItem,
  onReportLostItem,
}) {
  return (
    <section className={`${styles.hero} ${styles.sectionSpacing}`}>
      <div className={styles.container}>
        <h1 id="hero-headline" className={styles.title}>
          Lost something or found an item?
        </h1>

        <p id="hero-subtext" className={styles.subtitle}>
          Report lost or found items and help reunite belongings with their owners.
        </p>

        <div className={styles.actions}>
          <button
            id="lost-btn"
            className={`${styles.btnTransition} ${styles.primaryBtn}`}
            onClick={onReportLostItem}
            type="button"
          >
            Report Lost Item
          </button>

          <button
            id="found-btn"
            className={`${styles.btnTransition} ${styles.secondaryBtn}`}
            onClick={onReportFoundItem}
            type="button"
          >
            Report Found Item
          </button>
        </div>
      </div>
    </section>
  );
}
