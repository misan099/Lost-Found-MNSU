import { useState } from "react";
import styles from "./LostItemHeader.module.css";

// Import the same modal used in Dashboard
import AddLostItemModal from "../dashboard/addLostItem/AddLostItemModal";

export default function LostItemHeader({ onItemAdded }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.row}>
            <div>
              <h1 className={styles.title}>Lost Items</h1>
              <p className={styles.subtitle}>
                Items reported as lost by users
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
              Report Lost Item
            </button>
          </div>
        </div>
      </section>

      {/* Same modal, controlled properly */}
      <AddLostItemModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onSuccess={onItemAdded}
      />
    </>
  );
}
