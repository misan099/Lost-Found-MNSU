import { useState } from "react";
import styles from "./FoundItemHeader.module.css";

// ✅ IMPORT the SAME modal used in Dashboard
import AddFoundItemModal from "../../dashboard/addFoundItem/AddFoundItemModal";

export default function FoundItemHeader({ onItemAdded }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.row}>
            <div>
              <h1 className={styles.title}>Found Items</h1>
              <p className={styles.subtitle}>
                Items reported as found by users
              </p>
            </div>

            <button
              className={styles.actionButton}
              type="button"
              onClick={() => setOpen(true)}
            >
              <svg
                className={styles.actionIcon}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Found Item
            </button>
          </div>
        </div>
      </section>

      {/* ✅ SAME MODAL – controlled properly */}
      <AddFoundItemModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onSuccess={onItemAdded} // optional (refresh list)
      />
    </>
  );
}
