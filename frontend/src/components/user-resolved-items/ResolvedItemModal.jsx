import {
  HiOutlineCheckCircle,
  HiOutlineLocationMarker,
  HiOutlineX,
} from "react-icons/hi";
import styles from "../../pages/user/resolved-items/ResolvedItems.module.css";

export default function ResolvedItemModal({ item, onClose, formatDate }) {
  if (!item) return null;
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modalContent}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Item Details</h2>
          <button type="button" className={styles.btnClose} onClick={onClose}>
            <HiOutlineX />
          </button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.detailsImage}>
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.name}
                className={styles.detailsImageContent}
              />
            ) : (
              <HiOutlineCheckCircle />
            )}
          </div>

          <div className={styles.successBanner}>
            <div className={styles.successBannerIcon}>
              <HiOutlineCheckCircle />
            </div>
            <div className={styles.successBannerTitle}>
              Item Successfully Returned
            </div>
            <div className={styles.successBannerText}>
              This item has been returned to its owner
            </div>
          </div>

          <div className={styles.detailsSection}>
            <div className={styles.detailsLabel}>Item Name</div>
            <div className={styles.detailsValue}>{item.name}</div>
          </div>

          <div className={styles.detailsSection}>
            <div className={styles.detailsLabel}>Category</div>
            <div className={styles.detailsValue}>{item.category}</div>
          </div>

          <div className={styles.detailsSection}>
            <div className={styles.detailsLabel}>Location</div>
            <div className={styles.detailsValue}>
              <HiOutlineLocationMarker /> {item.location}
            </div>
          </div>

          <div className={styles.detailsSection}>
            <div className={styles.detailsLabel}>Date Resolved</div>
            <div className={styles.detailsValue}>
              {formatDate(item.dateResolved)}
            </div>
          </div>

          <div className={styles.detailsSection}>
            <div className={styles.detailsLabel}>Description</div>
            <div className={styles.detailsValue}>{item.description}</div>
          </div>

          {item.timeline?.length ? (
            <div className={styles.timelineSection}>
              <h3 className={styles.timelineTitle}>Resolution Timeline</h3>
              <div className={styles.timeline}>
                {item.timeline.map((step, index) => (
                  <div key={`${step.step}-${index}`} className={styles.timelineItem}>
                    <div className={styles.timelineDot}></div>
                    <div className={styles.timelineContent}>
                      <div className={styles.timelineStep}>{step.step}</div>
                      <div className={styles.timelineDesc}>{step.desc}</div>
                      <div className={styles.timelineDate}>
                        {formatDate(step.date)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
