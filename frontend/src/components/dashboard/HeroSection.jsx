import styles from "./HeroSection.module.css";

export default function HeroSection({ onReportFoundItem }) {
  return (
    <section className={styles.hero}>
      <div className="container">
        <h1 className={styles.title}>
          Lost something or found an item?
        </h1>

        <p className={styles.subtitle}>
          Report lost or found items and help reunite belongings with their owners.
        </p>

        <div className={styles.actions}>
          <button className={`btn btn-primary ${styles.primaryBtn}`}>
            Report Lost Item
          </button>

          <button
            className={`btn btn-success ${styles.secondaryBtn}`}
            onClick={onReportFoundItem}
          >
            Report Found Item
          </button>
        </div>
      </div>
    </section>
  );
}
