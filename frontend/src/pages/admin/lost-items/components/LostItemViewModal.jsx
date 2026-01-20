import {
  HiOutlineInformationCircle,
  HiOutlineLocationMarker,
  HiOutlineX,
} from "react-icons/hi";

import styles from "../AdminLostItems.module.css";
import {
  formatNepaliDate,
  formatStatusLabel,
} from "../utils/lostItemUtils";

const getStatusClass = (status) => {
  if (status === "claim-requested") return styles.statusClaimRequested;
  if (status === "verified") return styles.statusVerified;
  if (status === "resolved") return styles.statusResolved;
  return styles.statusAvailable;
};

export default function LostItemViewModal({ item, onClose }) {
  if (!item) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modalContent}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Lost Item Details</h2>
          <button
            type="button"
            className={styles.modalClose}
            onClick={onClose}
          >
            <HiOutlineX />
          </button>
        </div>
        <div className={styles.modalViewBody}>
          {item.imageUrl && (
            <div className={styles.modalMedia}>
              <img
                src={item.imageUrl}
                alt={item.name}
                className={styles.modalImage}
              />
            </div>
          )}
          <div className={styles.modalDetails}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Item Name</span>
              <span className={styles.detailValue}>{item.name}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Category</span>
              <span className={styles.detailValue}>{item.category}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>
                <HiOutlineLocationMarker />
                Location
              </span>
              <span className={styles.detailValue}>{item.location}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Date Lost</span>
              <span className={styles.detailValue}>
                {formatNepaliDate(item.dateLost)}
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Reported By</span>
              <span className={styles.detailValue}>{item.postedBy}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Status</span>
              <span className={styles.detailValue}>
                <span
                  className={`${styles.statusBadge} ${getStatusClass(
                    item.status
                  )}`}
                >
                  {formatStatusLabel(item.status)}
                </span>
              </span>
            </div>
            {item.status === "claim-requested" && (
              <div className={styles.noticeBox}>
                <HiOutlineInformationCircle
                  className={styles.noticeIcon}
                />
                <span>
                  Verification happens in Claims &amp; Verification.
                </span>
              </div>
            )}
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Description</span>
              <span className={styles.detailValue}>
                {item.description || "-"}
              </span>
            </div>

            {(item.status === "verified" || item.status === "resolved") &&
              item.claim && (
                <div className={styles.claimSection}>
                  <h3 className={styles.sectionTitle}>Claim Details</h3>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Statement</span>
                    <span className={styles.detailValue}>
                      {item.claim?.claimDetails?.text || "-"}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Detail Type</span>
                    <span className={styles.detailValue}>
                      {item.claim?.claimDetails?.type || "-"}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Extra Context</span>
                    <span className={styles.detailValue}>
                      {item.claim?.claimDetails?.additionalContext || "-"}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Proof Image</span>
                    <span className={styles.detailValue}>
                      {item.claim?.claimDetails?.proofImageUrl ? (
                        <img
                          src={item.claim.claimDetails.proofImageUrl}
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
