import {
  HiOutlineLocationMarker,
  HiOutlineX,
  HiOutlinePhotograph,
} from "react-icons/hi";
import styles from "../../../pages/admin/resolved-items/ResolvedItems.module.css";
import { formatNepaliDate } from "../../../utils/resolved-items/resolvedItemsUtils";

export default function ResolvedItemViewModal({ item, type, onClose }) {
  if (!item) return null;

  const isLost = type === "lost";
  const title = isLost ? "Lost Item Details" : "Found Item Details";
  const dateLabel = isLost ? "Date Lost" : "Date Found";
  const postedLabel = isLost ? "Reported By" : "Posted By";
  const claimDetails = item.claimDetails || {};
  const hasClaimDetails =
    claimDetails.text ||
    claimDetails.type ||
    claimDetails.additionalContext ||
    claimDetails.proofImageUrl;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modalContent}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{title}</h2>
          <button
            type="button"
            className={styles.modalClose}
            onClick={onClose}
          >
            <HiOutlineX />
          </button>
        </div>
        <div className={styles.modalViewBody}>
          <div className={styles.modalMedia}>
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.name || "Item"}
                className={styles.modalImage}
              />
            ) : (
              <div className={styles.imagePlaceholder}>
                <HiOutlinePhotograph />
                <span>No image provided</span>
              </div>
            )}
          </div>
          <div className={styles.modalDetails}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Item Name</span>
              <span className={styles.detailValue}>{item.name || "-"}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Category</span>
              <span className={styles.detailValue}>
                {item.category || "-"}
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>
                <HiOutlineLocationMarker />
                Location
              </span>
              <span className={styles.detailValue}>
                {item.location || "-"}
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>{dateLabel}</span>
              <span className={styles.detailValue}>
                {formatNepaliDate(item.date)}
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>{postedLabel}</span>
              <span className={styles.detailValue}>
                {item.postedBy || "-"}
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Status</span>
              <span className={styles.detailValue}>
                <span className={styles.statusBadge}>Resolved</span>
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Description</span>
              <span className={styles.detailValue}>
                {item.description || "-"}
              </span>
            </div>

            {hasClaimDetails && (
              <div className={styles.claimSection}>
                <h3 className={styles.sectionTitle}>Claim Details</h3>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Statement</span>
                  <span className={styles.detailValue}>
                    {claimDetails.text || "-"}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Detail Type</span>
                  <span className={styles.detailValue}>
                    {claimDetails.type || "-"}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Extra Context</span>
                  <span className={styles.detailValue}>
                    {claimDetails.additionalContext || "-"}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Proof Image</span>
                  <span className={styles.detailValue}>
                    {claimDetails.proofImageUrl ? (
                      <img
                        src={claimDetails.proofImageUrl}
                        alt="Claim proof"
                        className={styles.claimProof}
                      />
                    ) : (
                      "-"
                    )}
                  </span>
                </div>

                <div className={styles.confirmationRow}>
                  <div className={styles.confirmationItem}>
                    <span>Owner confirmed</span>
                    <span>{item.ownerConfirmed ? "Yes" : "No"}</span>
                  </div>
                  <div className={styles.confirmationItem}>
                    <span>Finder confirmed</span>
                    <span>{item.finderConfirmed ? "Yes" : "No"}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
