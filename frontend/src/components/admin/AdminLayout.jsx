import {
  HiOutlineViewGrid,
  HiOutlineArchive,
  HiOutlineClipboardCheck,
  HiOutlineChatAlt2,
  HiOutlineCheckCircle,
  HiOutlineUsers,
  HiOutlineDocumentReport,
  HiOutlineLogout,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from "react-icons/hi";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import styles from "../../pages/admin/AdminDashboard.module.css";
import navStyles from "./AdminLayout.module.css";
import HeaderSearch from "../../features/search/HeaderSearch";
import AdminNotifications from "../../features/admin-notifications/AdminNotifications";

export default function AdminLayout({
  children,
  onLogout = () => {},
}) {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const getNavClass = ({ isActive }) =>
    `${styles.menuItem} ${navStyles.menuItem} ${
      isActive ? navStyles.activeItem : ""
    }`;

  return (
    <div className={styles.dashboardContainer}>
      {/* ================= SIDEBAR ================= */}
      <aside
        className={`${styles.sidebar} ${
          isCollapsed ? navStyles.sidebarCollapsed : ""
        }`}
      >
        <div className={styles.sidebarHeader}>
          <div className={navStyles.sidebarHeaderRow}>
            <h1 className={`${styles.appName} ${navStyles.appName}`}>
              Lost &amp; Found Nepal
            </h1>
            <button
              type="button"
              className={navStyles.sidebarToggle}
              onClick={() => setIsCollapsed((prev) => !prev)}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? <HiOutlineChevronRight /> : <HiOutlineChevronLeft />}
            </button>
          </div>
        </div>

        <nav className={styles.sidebarMenu}>
          <NavLink
            to="/admin/dashboard"
            className={getNavClass}
            data-label="Dashboard"
          >
            <HiOutlineViewGrid />
            <span className={navStyles.menuLabel}>Dashboard</span>
          </NavLink>

          <NavLink
            to="/admin/lost-items"
            className={getNavClass}
            data-label="Manage Lost Items"
          >
            <HiOutlineArchive />
            <span className={navStyles.menuLabel}>Manage Lost Items</span>
          </NavLink>

          <NavLink
            to="/admin/found-items"
            className={getNavClass}
            data-label="Manage Found Items"
          >
            <HiOutlineClipboardCheck />
            <span className={navStyles.menuLabel}>Manage Found Items</span>
          </NavLink>

          <NavLink
            to="/admin/claims"
            className={getNavClass}
            data-label="Claims & Verification"
          >
            <HiOutlineCheckCircle />
            <span className={navStyles.menuLabel}>
              Claims &amp; Verification
            </span>
          </NavLink>

          <NavLink
            to="/admin/messages"
            className={getNavClass}
            data-label="Messages"
          >
            <HiOutlineChatAlt2 />
            <span className={navStyles.menuLabel}>Messages</span>
          </NavLink>

          <NavLink
            to="/admin/resolved"
            className={getNavClass}
            data-label="Resolved Items"
          >
            <HiOutlineCheckCircle />
            <span className={navStyles.menuLabel}>Resolved Items</span>
          </NavLink>

          <NavLink
            to="/admin/users"
            className={getNavClass}
            data-label="Users"
          >
            <HiOutlineUsers />
            <span className={navStyles.menuLabel}>Users</span>
          </NavLink>

          <NavLink
            to="/admin/reports"
            className={getNavClass}
            data-label="Reports"
          >
            <HiOutlineDocumentReport />
            <span className={navStyles.menuLabel}>Reports</span>
          </NavLink>

          {/* LOGOUT */}
          <div
            className={`${styles.menuItem} ${styles.logout} ${navStyles.menuItem}`}
            onClick={onLogout}
            role="button"
            tabIndex={0}
            data-label="Logout"
          >
            <HiOutlineLogout />
            <span className={navStyles.menuLabel}>Logout</span>
          </div>
        </nav>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className={styles.mainContent}>
        {/* ---------- HEADER ---------- */}
        <header className={styles.topHeader}>
          <h2 className={styles.pageTitle}>Admin Dashboard</h2>

          <HeaderSearch
            containerClassName={styles.headerCenter}
            inputClassName={styles.searchBar}
            iconClassName={styles.searchIcon}
            onResultSelect={(item) => {
              if (item?.type === "lost") {
                navigate("/admin/lost-items");
                return;
              }
              navigate("/admin/found-items");
            }}
          />

          <div className={styles.headerRight}>
            <AdminNotifications />
            <span className={styles.adminUser}>Admin User</span>
          </div>
        </header>

        {/* ---------- CONTENT ---------- */}
        <div className={styles.dashboardContent}>{children}</div>
      </main>
    </div>
  );
}
