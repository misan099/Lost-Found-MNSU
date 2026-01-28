import {
  HiOutlineEye,
  HiOutlineLocationMarker,
  HiOutlineClipboardCheck,
} from "react-icons/hi";
import styles from "../../../pages/admin/resolved-items/ResolvedItems.module.css";
import { formatNepaliDate } from "../../../utils/resolved-items/resolvedItemsUtils";

const resolveViewAction = (claim) => {
  const hasLost = Boolean(claim?.lostItem?.id || claim?.lostItem?.name);
  const hasFound = Boolean(claim?.foundItem?.id || claim?.foundItem?.name);
  const claimType = claim?.claimType;

  if (claimType === "lost" && hasLost) {
    return { label: "View Lost", type: "lost" };
  }
  if (claimType === "found" && hasFound) {
    return { label: "View Found", type: "found" };
  }
  if (hasLost) {
    return { label: "View Lost", type: "lost" };
  }
  if (hasFound) {
    return { label: "View Found", type: "found" };
  }
  return { label: "Details Unavailable", type: null };
};

export default function ResolvedItemsTable({
  items,
  loading,
  onViewItem,
  onViewSummary,
}) {
  if (loading) {
    return (
      <div className={styles.tableContainer}>
        <div className={styles.noItems}>Loading resolved items...</div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className={styles.tableContainer}>
        <div className={styles.noItems}>No resolved items found</div>
      </div>
    );
  }

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead className={styles.tableHead}>
          <tr>
            <th className={styles.tableHeader}>Claim ID</th>
            <th className={styles.tableHeader}>Lost Item</th>
            <th className={styles.tableHeader}>Found Item</th>
            <th className={styles.tableHeader}>Lost Owner</th>
            <th className={styles.tableHeader}>Found Owner</th>
            <th className={styles.tableHeader}>Resolution Date</th>
            <th className={styles.tableHeader}>Status</th>
            <th className={styles.tableHeader}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((claim) => {
            const viewAction = resolveViewAction(claim);
            const lostName = claim?.lostItem?.name || "-";
            const lostLocation = claim?.lostItem?.location || "-";
            const foundName = claim?.foundItem?.name || "-";
            const foundLocation = claim?.foundItem?.location || "-";

            return (
              <tr key={claim.id} className={styles.tableRow}>
                <td className={styles.tableCell}>
                  <strong>#{claim.id}</strong>
                </td>
                <td className={styles.tableCell}>
                  <div className={styles.itemCell}>
                    <div className={styles.itemName}>{lostName}</div>
                    <div className={styles.itemLocation}>
                      <HiOutlineLocationMarker />
                      <span>{lostLocation}</span>
                    </div>
                  </div>
                </td>
                <td className={styles.tableCell}>
                  <div className={styles.itemCell}>
                    <div className={styles.itemName}>{foundName}</div>
                    <div className={styles.itemLocation}>
                      <HiOutlineLocationMarker />
                      <span>{foundLocation}</span>
                    </div>
                  </div>
                </td>
                <td className={styles.tableCell}>
                  <span className={styles.ownerName}>
                    {claim?.lostOwnerName || "-"}
                  </span>
                </td>
                <td className={styles.tableCell}>
                  <span className={styles.ownerName}>
                    {claim?.foundOwnerName || "-"}
                  </span>
                </td>
                <td className={styles.tableCell}>
                  {formatNepaliDate(claim?.resolvedAt)}
                </td>
                <td className={styles.tableCell}>
                  <span className={styles.statusBadge}>Resolved</span>
                </td>
                <td className={styles.tableCell}>
                  <div className={styles.actionButtons}>
                    <button
                      type="button"
                      className={`${styles.button} ${styles.buttonView}`}
                      onClick={() =>
                        viewAction.type && onViewItem(claim, viewAction.type)
                      }
                      disabled={!viewAction.type}
                    >
                      <HiOutlineEye />
                      {viewAction.label}
                    </button>
                    <button
                      type="button"
                      className={`${styles.button} ${styles.buttonSummary}`}
                      onClick={() => onViewSummary(claim)}
                    >
                      <HiOutlineClipboardCheck />
                      View Summary
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
