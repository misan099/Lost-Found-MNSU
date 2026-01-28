import { HiOutlineCheckCircle } from "react-icons/hi";
import styles from "../../pages/user/resolved-items/ResolvedItems.module.css";

export default function ResolvedItemsEmpty({ title, text }) {
  return (
    <div className={styles.emptyState}>
      <HiOutlineCheckCircle className={styles.emptyIcon} />
      <h2 className={styles.emptyTitle}>{title}</h2>
      <p className={styles.emptyText}>{text}</p>
    </div>
  );
}
