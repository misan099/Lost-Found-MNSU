import styles from "./MyPosts.module.css";

export default function ConfirmDeleteModal({ post, onCancel, onConfirm }) {
  if (!post) return null;

  return (
    <div className={styles.modalOverlay} onClick={onCancel}>
      <div
        className={styles.modalContent}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.modalIcon}>DEL</div>
        <h2 className={styles.modalTitle}>Delete Post?</h2>
        <p className={styles.modalText}>
          Are you sure you want to delete this post? This action cannot be
          undone.
        </p>
        <div className={styles.modalActions}>
          <button
            type="button"
            className={styles.btnCancel}
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className={styles.btnConfirmDelete}
            onClick={() => onConfirm(post)}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
