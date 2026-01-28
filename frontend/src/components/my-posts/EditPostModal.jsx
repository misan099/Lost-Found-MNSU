import { useEffect, useState } from "react";
import styles from "./MyPosts.module.css";

const formatInputDate = (value) => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().split("T")[0];
};

export default function EditPostModal({ post, onClose, onSave }) {
  const [form, setForm] = useState({
    name: "",
    category: "",
    location: "",
    date: "",
    description: "",
  });

  useEffect(() => {
    if (!post) return;
    setForm({
      name: post.name || "",
      category: post.category || "",
      location: post.location || "",
      date: formatInputDate(post.date),
      description: post.description || "",
    });
  }, [post]);

  if (!post) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modalContent}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Edit Post</h2>
          <button
            type="button"
            className={styles.btnClose}
            onClick={onClose}
          >
            X
          </button>
        </div>
        <div className={styles.modalBody}>
          <label className={styles.formLabel}>
            Item Name
            <input
              type="text"
              value={form.name}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, name: event.target.value }))
              }
            />
          </label>
          <label className={styles.formLabel}>
            Category
            <input
              type="text"
              value={form.category}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, category: event.target.value }))
              }
            />
          </label>
          <label className={styles.formLabel}>
            Location
            <input
              type="text"
              value={form.location}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, location: event.target.value }))
              }
            />
          </label>
          <label className={styles.formLabel}>
            {post.type === "found" ? "Date Found" : "Date Lost"}
            <input
              type="date"
              value={form.date}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, date: event.target.value }))
              }
            />
          </label>
          <label className={styles.formLabel}>
            Description
            <textarea
              rows={4}
              value={form.description}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, description: event.target.value }))
              }
            />
          </label>
        </div>
        <div className={styles.modalActions}>
          <button
            type="button"
            className={styles.btnCancel}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className={styles.btnConfirm}
            onClick={() => onSave(form)}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
