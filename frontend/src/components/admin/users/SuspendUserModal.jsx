import { useState } from "react";
import styles from "../../../pages/admin/users/AdminUsers.module.css";

export default function SuspendUserModal({ user, onClose, onSubmit }) {
  const [durationDays, setDurationDays] = useState(1);
  const [note, setNote] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  if (!user) return null;

  const handleSubmit = () => {
    if (!note.trim()) {
      setErrorMessage("Suspension note is required.");
      return;
    }
    onSubmit({ durationDays, note: note.trim() });
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modalContent}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Suspend User</h2>
          <button
            type="button"
            className={`${styles.closeButton} ${styles.cancelButton}`}
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.profileField}>
            <div className={styles.fieldLabel}>User</div>
            <div className={styles.fieldValue}>{user.name}</div>
          </div>
          <label className={styles.formLabel} htmlFor="suspendDuration">
            Suspension Duration
          </label>
          <select
            id="suspendDuration"
            className={styles.formControl}
            value={durationDays}
            onChange={(event) =>
              setDurationDays(Number(event.target.value))
            }
          >
            <option value={1}>1 day</option>
            <option value={2}>2 days</option>
          </select>
          <label className={styles.formLabel} htmlFor="suspendNote">
            Suspension Note
          </label>
          <textarea
            id="suspendNote"
            className={`${styles.formControl} ${styles.textareaControl}`}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Explain why this user is suspended..."
          />
          <span className={styles.helperText}>
            This note will be shared with the user in their message box.
          </span>
          {errorMessage && (
            <div className={styles.errorMessage}>{errorMessage}</div>
          )}
        </div>
        <div className={styles.modalFooter}>
          <button
            type="button"
            className={`${styles.button} ${styles.buttonSuspend}`}
            onClick={handleSubmit}
          >
            Confirm Suspension
          </button>
        </div>
      </div>
    </div>
  );
}
