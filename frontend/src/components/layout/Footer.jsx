import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={`${styles.footer} bg-white border-top mt-5`}>
      <div
        className={`container py-4 d-flex flex-column flex-md-row justify-content-between align-items-center gap-2`}
      >
        <p className={styles.text}>
          © 2025 Lost & Found. All rights reserved.
        </p>

        <div className={styles.links}>
          <a href="#" className={styles.link}>Help</a>
          <a href="#" className={styles.link}>Privacy</a>
          <a href="#" className={styles.link}>Contact</a>
        </div>
      </div>
    </footer>
  );
}
