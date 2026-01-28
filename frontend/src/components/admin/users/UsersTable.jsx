import styles from "../../../pages/admin/users/AdminUsers.module.css";
import { formatUserDate, getRoleLabel, getStatusLabel } from "../../../utils/admin/userUtils";

const getRoleClass = (role) =>
  role === "admin" ? styles.roleAdmin : styles.roleUser;

const getStatusClass = (status) => {
  if (status === "suspended") return styles.statusSuspended;
  if (status === "blocked") return styles.statusBlocked;
  return styles.statusActive;
};

export default function UsersTable({
  users,
  loading,
  onViewProfile,
  onSuspend,
  onBlock,
  onActivate,
}) {
  if (loading) {
    return (
      <div className={styles.tableWrapper}>
        <div className={styles.noItems}>Loading users...</div>
      </div>
    );
  }

  if (!users.length) {
    return (
      <div className={styles.tableWrapper}>
        <div className={styles.noItems}>No users found</div>
      </div>
    );
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead className={styles.tableHead}>
          <tr>
            <th className={styles.tableHeader}>User ID</th>
            <th className={styles.tableHeader}>Full Name</th>
            <th className={styles.tableHeader}>Email</th>
            <th className={styles.tableHeader}>Role</th>
            <th className={styles.tableHeader}>Status</th>
            <th className={styles.tableHeader}>Joined Date</th>
            <th className={styles.tableHeader}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => {
            const isAdmin = user.role === "admin";
            const isActive = user.status === "active";
            const isSuspended = user.status === "suspended";
            const isBlocked = user.status === "blocked";

            return (
              <tr key={user.id} className={styles.tableRow}>
                <td className={styles.tableCell}>
                  <strong>#{index + 1}</strong>
                </td>
                <td className={styles.tableCell}>
                  <div className={styles.userName}>{user.name}</div>
                </td>
                <td className={styles.tableCell}>
                  <div className={styles.userEmail}>
                    {user.email || "-"}
                  </div>
                </td>
                <td className={styles.tableCell}>
                  <span
                    className={`${styles.roleBadge} ${getRoleClass(
                      user.role
                    )}`}
                  >
                    {getRoleLabel(user.role)}
                  </span>
                </td>
                <td className={styles.tableCell}>
                  <span
                    className={`${styles.statusBadge} ${getStatusClass(
                      user.status
                    )}`}
                  >
                    {getStatusLabel(user.status)}
                  </span>
                </td>
                <td className={styles.tableCell}>
                  {formatUserDate(user.joinedAt)}
                </td>
                <td className={styles.tableCell}>
                  <div className={styles.actionButtons}>
                    <button
                      type="button"
                      className={`${styles.button} ${styles.buttonView}`}
                      onClick={() => onViewProfile(user)}
                    >
                      View Profile
                    </button>
                    {isActive && (
                      <>
                        <button
                          type="button"
                          className={`${styles.button} ${styles.buttonSuspend}`}
                          onClick={() => onSuspend(user)}
                          disabled={isAdmin}
                        >
                          Suspend
                        </button>
                        <button
                          type="button"
                          className={`${styles.button} ${styles.buttonBlock}`}
                          onClick={() => onBlock(user)}
                          disabled={isAdmin}
                        >
                          Block
                        </button>
                      </>
                    )}
                    {(isSuspended || isBlocked) && (
                      <button
                        type="button"
                        className={`${styles.button} ${styles.buttonActivate}`}
                        onClick={() => onActivate(user)}
                        disabled={isAdmin}
                      >
                        Activate
                      </button>
                    )}
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
