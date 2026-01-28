import { HiOutlineX } from "react-icons/hi";
import styles from "../../../pages/admin/resolved-items/ResolvedItems.module.css";
import { formatNepaliDate } from "../../../utils/resolved-items/resolvedItemsUtils";

export default function ResolvedSummaryModal({ claim, onClose }) {
  if (!claim) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={`${styles.modalContent} ${styles.summaryModal}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Resolution Summary</h2>
          <button
            type="button"
            className={styles.modalClose}
            onClick={onClose}
          >
            <HiOutlineX />
          </button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Claim ID</span>
            <span className={styles.detailValue}>#{claim.id}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Lost Item</span>
            <span className={styles.detailValue}>
              {claim?.lostItem?.name || "-"}
            </span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Found Item</span>
            <span className={styles.detailValue}>
              {claim?.foundItem?.name || "-"}
            </span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Lost Owner</span>
            <span className={styles.detailValue}>
              {claim?.lostOwnerName || "-"}
            </span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Finder</span>
            <span className={styles.detailValue}>
              {claim?.foundOwnerName || "-"}
            </span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Resolution Date</span>
            <span className={styles.detailValue}>
              {formatNepaliDate(claim?.resolvedAt)}
            </span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Status</span>
            <span className={styles.detailValue}>
              <span className={styles.statusBadge}>Resolved</span>
            </span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Verification Notes</span>
            <span className={styles.detailValue}>
              {claim?.resolutionNote || "-"}
            </span>
          </div>
        </div>
        <div className={styles.modalFooter}>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
