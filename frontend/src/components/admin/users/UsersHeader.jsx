import styles from "../../../pages/admin/users/AdminUsers.module.css";

export default function UsersHeader() {
  return (
    <header className={styles.pageHeader}>
      <h1 className={styles.pageTitle}>Users</h1>
      <p className={styles.subtitle}>
        Manage registered users and control account access
      </p>
    </header>
  );
}
