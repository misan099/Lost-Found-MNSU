import { HiOutlineTrash } from "react-icons/hi";

import styles from "../AdminLostItems.module.css";

export default function ConfirmDeleteModal({
  item,
  onClose,
  onConfirm,
}) {
  if (!item) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={`${styles.modalContent} ${styles.confirmModal}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.modalBody}>
          <div className={styles.confirmIcon}>
            <HiOutlineTrash />
          </div>
          <p className={styles.confirmMessage}>
            {`Delete "${item.name}"? This cannot be undone.`}
          </p>
          <div className={styles.confirmActions}>
            <button
              type="button"
              className={`${styles.confirmBtn} ${styles.btnCancel}`}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className={`${styles.confirmBtn} ${styles.btnConfirm}`}
              onClick={onConfirm}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
