import {
  HiOutlineViewGrid,
  HiOutlineArchive,
  HiOutlineClipboardCheck,
  HiOutlineChatAlt2,
  HiOutlineCheckCircle,
  HiOutlineUsers,
  HiOutlineDocumentReport,
  HiOutlineCog,
  HiOutlineLogout,
  HiOutlineBell,
  HiOutlineSearch,
} from "react-icons/hi";
import { NavLink } from "react-router-dom";
import styles from "../../pages/admin/AdminDashboard.module.css";
import navStyles from "./AdminLayout.module.css";

export default function AdminLayout({
  children,
  onLogout = () => {},
}) {
  const getNavClass = ({ isActive }) =>
    `${styles.menuItem} ${navStyles.menuItem} ${
      isActive ? navStyles.activeItem : ""
    }`;

  return (
    <div className={styles.dashboardContainer}>
      {/* ================= SIDEBAR ================= */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h1 className={styles.appName}>Lost &amp; Found Nepal</h1>
        </div>

        <nav className={styles.sidebarMenu}>
          <NavLink to="/admin/dashboard" className={getNavClass}>
            <HiOutlineViewGrid /> Dashboard
          </NavLink>

          <NavLink to="/admin/lost-items" className={getNavClass}>
            <HiOutlineArchive /> Manage Lost Items
          </NavLink>

          <NavLink to="/admin/found-items" className={getNavClass}>
            <HiOutlineClipboardCheck /> Manage Found Items
          </NavLink>

          <NavLink to="/admin/claims" className={getNavClass}>
            <HiOutlineCheckCircle /> Claims &amp; Verification
          </NavLink>

          <NavLink to="/admin/messages" className={getNavClass}>
            <HiOutlineChatAlt2 /> Messages
          </NavLink>

          <NavLink to="/admin/resolved" className={getNavClass}>
            <HiOutlineCheckCircle /> Resolved Items
          </NavLink>

          <div className={styles.menuItem}>
            <HiOutlineUsers /> Users
          </div>

          <div className={styles.menuItem}>
            <HiOutlineDocumentReport /> Reports
          </div>

          <div className={styles.menuItem}>
            <HiOutlineCog /> Settings
          </div>

          {/* LOGOUT */}
          <div
            className={`${styles.menuItem} ${styles.logout}`}
            onClick={onLogout}
            role="button"
            tabIndex={0}
          >
            <HiOutlineLogout /> Logout
          </div>
        </nav>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className={styles.mainContent}>
        {/* ---------- HEADER ---------- */}
        <header className={styles.topHeader}>
          <h2 className={styles.pageTitle}>Admin Dashboard</h2>

          <div className={styles.headerCenter}>
            <HiOutlineSearch className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchBar}
              placeholder="Search items, users, locations..."
            />
          </div>

          <div className={styles.headerRight}>
            <div className={styles.notificationIcon}>
              <HiOutlineBell />
              <span className={styles.notificationBadge}>3</span>
            </div>
            <span className={styles.adminUser}>Admin User</span>
          </div>
        </header>

        {/* ---------- CONTENT ---------- */}
        <div className={styles.dashboardContent}>{children}</div>
      </main>
    </div>
  );
}
