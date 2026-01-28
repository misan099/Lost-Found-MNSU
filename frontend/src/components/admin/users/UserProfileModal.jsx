import styles from "../../../pages/admin/users/AdminUsers.module.css";
import {
  formatUserDate,
  getRoleLabel,
  getStatusLabel,
} from "../../../utils/admin/userUtils";

const getStatusClass = (status) => {
  if (status === "suspended") return styles.statusSuspended;
  if (status === "blocked") return styles.statusBlocked;
  return styles.statusActive;
};

export default function UserProfileModal({ user, onClose }) {
  if (!user) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modalContent}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>User Profile</h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.profileField}>
            <div className={styles.fieldLabel}>User ID</div>
            <div className={styles.fieldValue}>#{user.id}</div>
          </div>
          <div className={styles.profileField}>
            <div className={styles.fieldLabel}>Full Name</div>
            <div className={styles.fieldValue}>{user.name}</div>
          </div>
          <div className={styles.profileField}>
            <div className={styles.fieldLabel}>Email Address</div>
            <div className={styles.fieldValue}>{user.email || "-"}</div>
          </div>
          <div className={styles.profileField}>
            <div className={styles.fieldLabel}>Role</div>
            <div className={styles.fieldValue}>{getRoleLabel(user.role)}</div>
          </div>
          <div className={styles.profileField}>
            <div className={styles.fieldLabel}>Account Status</div>
            <div className={styles.fieldValue}>
              <span
                className={`${styles.statusBadge} ${getStatusClass(
                  user.status
                )}`}
              >
                {getStatusLabel(user.status)}
              </span>
            </div>
          </div>
          <div className={styles.profileField}>
            <div className={styles.fieldLabel}>Joined Date</div>
            <div className={styles.fieldValue}>
              {formatUserDate(user.joinedAt)}
            </div>
          </div>
          {user.suspendedUntil && (
            <div className={styles.profileField}>
              <div className={styles.fieldLabel}>Suspended Until</div>
              <div className={styles.fieldValue}>
                {formatUserDate(user.suspendedUntil)}
              </div>
            </div>
          )}
          {user.suspensionNote && (
            <div className={styles.profileField}>
              <div className={styles.fieldLabel}>Suspension Note</div>
              <div className={styles.fieldValue}>{user.suspensionNote}</div>
            </div>
          )}
          {user.blockedNote && (
            <div className={styles.profileField}>
              <div className={styles.fieldLabel}>Block Note</div>
              <div className={styles.fieldValue}>{user.blockedNote}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
