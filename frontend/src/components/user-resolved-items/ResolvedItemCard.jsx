import {
  HiOutlineBadgeCheck,
  HiOutlineCalendar,
  HiOutlineCheckCircle,
  HiOutlineLocationMarker,
} from "react-icons/hi";
import styles from "../../pages/user/resolved-items/ResolvedItems.module.css";

export default function ResolvedItemCard({ item, onSelect, formatDate }) {
  const typeLabel = item.type === "lost" ? "Lost" : "Found";
  return (
    <div className={styles.itemCard}>
      <div className={styles.itemImageContainer}>
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className={styles.itemImage}
          />
        ) : (
          <HiOutlineCheckCircle className={styles.placeholderIcon} />
        )}
        <span
          className={`${styles.itemTypeBadge} ${
            item.type === "lost" ? styles.itemTypeLost : styles.itemTypeFound
          }`}
        >
          {typeLabel}
        </span>
        <span className={styles.statusBadge}>
          <HiOutlineBadgeCheck />
          Returned
        </span>
      </div>
      <div className={styles.itemDetails}>
        <h3 className={styles.itemName}>{item.name}</h3>
        <p className={styles.itemCategory}>{item.category}</p>
        <div className={styles.itemMeta}>
          <div className={styles.metaItem}>
            <HiOutlineLocationMarker className={styles.metaIcon} />
            <span>{item.location}</span>
          </div>
          <div className={styles.metaItem}>
            <HiOutlineCalendar className={styles.metaIcon} />
            <span>Returned on {formatDate(item.dateResolved)}</span>
          </div>
        </div>
        <div className={styles.resolutionInfo}>
          <div className={styles.confirmationRow}>
            <div className={styles.confirmationItem}>
              <HiOutlineCheckCircle />
              <span>
                {item.ownerConfirmed ? "Owner confirmed" : "Owner pending"}
              </span>
            </div>
            <div className={styles.confirmationItem}>
              <HiOutlineCheckCircle />
              <span>
                {item.finderConfirmed ? "Finder confirmed" : "Finder pending"}
              </span>
            </div>
          </div>
          <p className={styles.completionLabel}>
            Exchange successfully completed
          </p>
        </div>
        <div className={styles.itemActions}>
          <button
            type="button"
            className={styles.btnView}
            onClick={onSelect}
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}
