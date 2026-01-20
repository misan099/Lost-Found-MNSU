// src/dashboard/foundItem/modal/FoundItemDetailsModal.jsx
import { useEffect } from "react";
import styles from "./FoundItemDetailsModal.module.css";
import { HiX } from "react-icons/hi";
import { HiOutlineLocationMarker, HiOutlineCalendar } from "react-icons/hi";
import { HiLockClosed } from "react-icons/hi2";

export default function FoundItemDetailsModal({
  open,
  item,
  onClose,
  onOpenClaim,
}) {
  // ESC close + lock scroll
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open || !item) return null;

  const canClaim = item.status === "available"; // backend rule mirror

  return (
    <div className={styles.overlay} onMouseDown={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Found Item Details</h2>
          <button className={styles.iconBtn} onClick={onClose} type="button" aria-label="Close">
            <HiX size={24} />
          </button>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {/* Image */}
          <div className={styles.imageBox}>
            {item.image_url ? (
              <img className={styles.image} src={item.image_url} alt={item.item_name} />
            ) : (
              <div className={styles.placeholder}>No image</div>
            )}
          </div>

          {/* Info */}
          <div className={styles.info}>
            <div>
              <h3 className={styles.itemName}>{item.item_name}</h3>
              <p className={styles.category}>{item.category}</p>
            </div>

            <div>
              <span className={`${styles.badge} ${item.status === "available" ? styles.badgeAvailable : styles.badgeClaimRequested}`}>
                {item.status}
              </span>
            </div>

            <div className={styles.meta}>
              <div className={styles.metaRow}>
                <HiOutlineLocationMarker className={styles.metaIcon} />
                <div>
                  <p className={styles.metaLabel}>Location</p>
                  <p className={styles.metaValue}>{item.location}</p>
                </div>
              </div>

              <div className={styles.metaRow}>
                <HiOutlineCalendar className={styles.metaIcon} />
                <div>
                  <p className={styles.metaLabel}>Date Found</p>
                  <p className={styles.metaValue}>{item.date_found}</p>
                </div>
              </div>
            </div>

            <div className={styles.desc}>
              <p className={styles.metaLabel}>Description</p>
              <p className={styles.descText}>{item.public_description}</p>
            </div>

            {/* Privacy Notice */}
            <div className={styles.privacyBox}>
              <div className={styles.privacyIcon}>
                <HiLockClosed size={18} />
              </div>
              <div>
                <p className={styles.privacyTitle}>Privacy Protection</p>
                <p className={styles.privacyText}>
                  Some details are hidden to protect privacy and prevent false claims.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button className={styles.secondaryBtn} onClick={onClose} type="button">
            Close
          </button>

          <button
            className={styles.primaryBtn}
            onClick={onOpenClaim}
            type="button"
            disabled={!canClaim}
            title={!canClaim ? "This item is not available for claiming" : "Claim this item"}
          >
            Claim This Item
          </button>
        </div>
      </div>
    </div>
  );
}
