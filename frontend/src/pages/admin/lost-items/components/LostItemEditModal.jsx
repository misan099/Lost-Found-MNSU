import { HiOutlineX } from "react-icons/hi";

import styles from "../AdminLostItems.module.css";

export default function LostItemEditModal({
  item,
  form,
  onChange,
  onClose,
  onSave,
}) {
  if (!item) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modalContent}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Edit Lost Item</h2>
          <button
            type="button"
            className={styles.modalClose}
            onClick={onClose}
          >
            <HiOutlineX />
          </button>
        </div>
        <div className={styles.modalBody}>
          <label className={styles.formLabel}>
            Item Name
            <input
              type="text"
              value={form.name}
              onChange={(event) => onChange("name", event.target.value)}
            />
          </label>
          <label className={styles.formLabel}>
            Category
            <input
              type="text"
              value={form.category}
              onChange={(event) => onChange("category", event.target.value)}
            />
          </label>
          <label className={styles.formLabel}>
            Location
            <input
              type="text"
              value={form.location}
              onChange={(event) => onChange("location", event.target.value)}
            />
          </label>
          <label className={styles.formLabel}>
            Date Lost
            <input
              type="date"
              value={form.dateLost}
              onChange={(event) => onChange("dateLost", event.target.value)}
            />
          </label>
          <label className={styles.formLabel}>
            Description
            <textarea
              rows={4}
              value={form.description}
              onChange={(event) =>
                onChange("description", event.target.value)
              }
            />
          </label>
        </div>
        <div className={styles.modalFooter}>
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
            onClick={onSave}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
