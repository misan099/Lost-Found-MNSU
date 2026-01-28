import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../../components/admin/AdminLayout";
import UsersHeader from "../../../components/admin/users/UsersHeader";
import UsersTable from "../../../components/admin/users/UsersTable";
import UserProfileModal from "../../../components/admin/users/UserProfileModal";
import SuspendUserModal from "../../../components/admin/users/SuspendUserModal";
import BlockUserModal from "../../../components/admin/users/BlockUserModal";
import useAdminUsers from "../../../hooks/admin/useAdminUsers";
import styles from "./AdminUsers.module.css";

export default function AdminUsers() {
  const navigate = useNavigate();
  const {
    users,
    loading,
    errorMessage,
    suspendUser,
    blockUser,
    activateUser,
  } = useAdminUsers();
  const [profileUser, setProfileUser] = useState(null);
  const [suspendTarget, setSuspendTarget] = useState(null);
  const [blockTarget, setBlockTarget] = useState(null);
  const [actionError, setActionError] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("isAdmin");

    navigate("/admin/login", { replace: true });
  };

  const handleSuspend = async ({ durationDays, note }) => {
    if (!suspendTarget) return;
    setActionError("");
    try {
      await suspendUser({
        userId: suspendTarget.id,
        durationDays,
        note,
      });
      setSuspendTarget(null);
    } catch (error) {
      setActionError(error?.message || "Unable to suspend user.");
    }
  };

  const handleBlock = async ({ note }) => {
    if (!blockTarget) return;
    setActionError("");
    try {
      await blockUser({
        userId: blockTarget.id,
        note,
      });
      setBlockTarget(null);
    } catch (error) {
      setActionError(error?.message || "Unable to block user.");
    }
  };

  const handleActivate = async (user) => {
    setActionError("");
    try {
      await activateUser({ userId: user.id, note: "" });
    } catch (error) {
      setActionError(error?.message || "Unable to activate user.");
    }
  };

  return (
    <AdminLayout onLogout={handleLogout}>
      <div className={styles.pageWrapper}>
        <div className={styles.container}>
          <UsersHeader />

          {errorMessage && (
            <div className={styles.errorMessage}>{errorMessage}</div>
          )}
          {actionError && (
            <div className={styles.errorMessage}>{actionError}</div>
          )}

          {!errorMessage && (
            <UsersTable
              users={users}
              loading={loading}
              onViewProfile={setProfileUser}
              onSuspend={setSuspendTarget}
              onBlock={setBlockTarget}
              onActivate={handleActivate}
            />
          )}
        </div>
      </div>

      {profileUser && (
        <UserProfileModal
          user={profileUser}
          onClose={() => setProfileUser(null)}
        />
      )}

      {suspendTarget && (
        <SuspendUserModal
          user={suspendTarget}
          onClose={() => setSuspendTarget(null)}
          onSubmit={handleSuspend}
        />
      )}

      {blockTarget && (
        <BlockUserModal
          user={blockTarget}
          onClose={() => setBlockTarget(null)}
          onSubmit={handleBlock}
        />
      )}
    </AdminLayout>
  );
}
