import {
  HiOutlineEye,
  HiOutlineInformationCircle,
  HiOutlinePencil,
  HiOutlineTrash,
} from "react-icons/hi";

import styles from "../AdminLostItems.module.css";
import { formatStatusLabel } from "../utils/lostItemUtils";

const getStatusClass = (status) => {
  if (status === "claim-requested") return styles.statusClaimRequested;
  if (status === "verified") return styles.statusVerified;
  if (status === "resolved") return styles.statusResolved;
  return styles.statusAvailable;
};

export default function LostItemsTable({
  items,
  loading,
  onView,
  onEdit,
  onDelete,
}) {
  return (
    <div className={styles.itemsContainer}>
      <table className={styles.itemsTable}>
        <thead>
          <tr>
            <th>Image</th>
            <th>Item Details</th>
            <th>Lost Location</th>
            <th>Date Lost</th>
            <th>Reported By</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={7} className={styles.noItems}>
                Loading items...
              </td>
            </tr>
          ) : items.length === 0 ? (
            <tr>
              <td colSpan={7} className={styles.noItems}>
                No items found.
              </td>
            </tr>
          ) : (
            items.map((item) => {
              const canEdit = item.status === "available";
              const rowClass =
                item.status !== "available" ? styles.rowLocked : "";

              return (
                <tr key={item.id} className={rowClass}>
                  <td>
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className={styles.itemImage}
                      />
                    ) : (
                      <div className={styles.itemImagePlaceholder}>
                        <HiOutlineInformationCircle />
                      </div>
                    )}
                  </td>
                  <td>
                    <div className={styles.itemName}>{item.name}</div>
                    <div className={styles.itemCategory}>
                      {item.category}
                    </div>
                  </td>
                  <td>{item.location}</td>
                  <td>{item.dateLostLabel}</td>
                  <td>{item.postedBy}</td>
                  <td>
                    <span
                      className={`${styles.statusBadge} ${getStatusClass(
                        item.status
                      )}`}
                    >
                      {formatStatusLabel(item.status)}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actionsCell}>
                      <button
                        type="button"
                        className={`${styles.actionBtn} ${styles.btnView}`}
                        onClick={() => onView(item)}
                      >
                        <HiOutlineEye />
                        View
                      </button>

                      {canEdit && (
                        <>
                          <button
                            type="button"
                            className={`${styles.actionBtn} ${styles.btnEdit}`}
                            onClick={() => onEdit(item)}
                          >
                            <HiOutlinePencil />
                            Edit
                          </button>
                          <button
                            type="button"
                            className={`${styles.actionBtn} ${styles.btnDelete}`}
                            onClick={() => onDelete(item)}
                          >
                            <HiOutlineTrash />
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
