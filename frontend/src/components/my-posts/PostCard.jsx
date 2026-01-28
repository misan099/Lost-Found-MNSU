import { HiOutlineCalendar, HiOutlineLocationMarker } from "react-icons/hi";
import styles from "./MyPosts.module.css";

const formatDate = (value, type) => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value);
  const label = type === "found" ? "Found on" : "Lost on";
  return `${label} ${parsed.toLocaleDateString("en-NP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })}`;
};

const statusLabels = {
  pending: "Pending",
  "claim-requested": "Claim Requested",
  matched: "Matched",
  returned: "Returned",
  verified: "Verified",
};

export default function PostCard({ post, onEdit, onDelete }) {
  const statusKey = post.status || "pending";
  const statusLabel = statusLabels[statusKey] || "Pending";
  const typeLabel = post.type === "found" ? "Found" : "Lost";
  const placeholder = post.name ? post.name.charAt(0).toUpperCase() : "?";

  return (
    <div className={styles.postCard}>
      <div className={styles.postImageContainer}>
        {post.image ? (
          <img
            src={post.image}
            alt={post.name}
            className={styles.postImage}
          />
        ) : (
          <span className={styles.postPlaceholder}>{placeholder}</span>
        )}
        <span
          className={`${styles.postTypeBadge} ${
            post.type === "found" ? styles.postTypeFound : styles.postTypeLost
          }`}
        >
          {typeLabel}
        </span>
        <span
          className={`${styles.statusBadge} ${
            styles[`status${statusKey.replace(/-/g, "")}`] || ""
          }`}
        >
          {statusLabel}
        </span>
      </div>
      <div className={styles.postDetails}>
        <h3 className={styles.postName}>{post.name || "Untitled"}</h3>
        <p className={styles.postCategory}>
          {post.category || "Uncategorized"}
        </p>
        <div className={styles.postMeta}>
          <div className={styles.metaItem}>
            <HiOutlineLocationMarker className={styles.metaIcon} />
            <span>{post.location || "Location not set"}</span>
          </div>
          <div className={styles.metaItem}>
            <HiOutlineCalendar className={styles.metaIcon} />
            <span>{formatDate(post.date, post.type)}</span>
          </div>
        </div>
        <div className={styles.postActions}>
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={() => onEdit(post)}
          >
            Edit
          </button>
          <button
            type="button"
            className={styles.btnDelete}
            onClick={() => onDelete(post)}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
