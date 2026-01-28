import { useState } from "react";
import styles from "../../../pages/admin/users/AdminUsers.module.css";

export default function BlockUserModal({ user, onClose, onSubmit }) {
  const [note, setNote] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  if (!user) return null;

  const handleSubmit = () => {
    if (!note.trim()) {
      setErrorMessage("Block note is required.");
      return;
    }
    onSubmit({ note: note.trim() });
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modalContent}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Block User</h2>
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
          <label className={styles.formLabel} htmlFor="blockNote">
            Block Note
          </label>
          <textarea
            id="blockNote"
            className={`${styles.formControl} ${styles.textareaControl}`}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Explain why this user is blocked..."
          />
          <span className={styles.helperText}>
            This note will be shown to the user during login.
          </span>
          {errorMessage && (
            <div className={styles.errorMessage}>{errorMessage}</div>
          )}
        </div>
        <div className={styles.modalFooter}>
          <button
            type="button"
            className={`${styles.button} ${styles.buttonBlock}`}
            onClick={handleSubmit}
          >
            Confirm Block
          </button>
        </div>
      </div>
    </div>
  );
}
