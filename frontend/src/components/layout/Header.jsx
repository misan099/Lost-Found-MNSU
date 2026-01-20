import { NavLink, useLocation, useNavigate } from "react-router-dom";
import styles from "./Header.module.css";
import appIcon from "../../assets/icons/appIcon.png";
import profileImage from "../../assets/images/profile.png";
import { logout } from "../../utils/auth/authToken";

export default function Header() {
  const username = "Prajal Danai";
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ Treat dashboard as Home
  const isHomeActive =
    location.pathname === "/" || location.pathname === "/dashboard";

  return (
    <>
      {/* 🔥 SPACER FOR FIXED HEADER */}
      <div className={styles.fakeHeader}></div>

      {/* 🔥 FIXED HEADER */}
      <header className={styles.header}>
        <div className={styles.container}>

          {/* LEFT (LOGO) */}
          <div className={styles.left}>
            <img src={appIcon} alt="App Icon" className={styles.logoImage} />
            <span className={styles.logoText}>Lost &amp; Found</span>
          </div>

          {/* CENTER (SEARCH) */}
          <div className={styles.center}>
            <i className={`bi bi-search ${styles.searchIcon}`}></i>
            <input
              type="text"
              placeholder="Search by item, location, category..."
              className={styles.searchInput}
            />
          </div>

          {/* RIGHT */}
          <div className={styles.right}>
            <nav className={styles.nav}>
              {/* ✅ HOME */}
              <NavLink
                to="/"
                className={isHomeActive ? styles.active : undefined}
              >
                Home
              </NavLink>

              {/* FOUND */}
              <NavLink
                to="/found"
                className={({ isActive }) =>
                  isActive ? styles.active : undefined
                }
              >
                Found Items
              </NavLink>

              <NavLink
                to="/lost"
                className={({ isActive }) =>
                  isActive ? styles.active : undefined
                }
              >
                Lost Items
              </NavLink>
              <a href="#">My Posts</a>
              <NavLink
                to="/messages"
                className={({ isActive }) =>
                  isActive ? styles.active : undefined
                }
              >
                Messages
              </NavLink>
              <a href="#">Resolve Items</a>
            </nav>

            <div className={styles.profile}>
              <img src={profileImage} alt="Profile" className={styles.avatar} />
              <span className={styles.username}>{username}</span>
            </div>

            <button
              className={styles.logout}
              type="button"
              onClick={() => {
                logout();
                navigate("/login", { replace: true });
              }}
            >
              Logout
            </button>
          </div>

        </div>
      </header>
    </>
  );
}
