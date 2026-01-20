import styles from "../AdminLostItems.module.css";

export default function Toast({ message, variant }) {
  if (!message) return null;

  return (
    <div className={`${styles.toast} ${styles[variant]}`}>
      {message}
    </div>
  );
}
