import { NavLink, useLocation, useNavigate } from "react-router-dom";
import styles from "./Header.module.css";
import appIcon from "../../assets/icons/Lost&FoundMNSU.png";
import { logout } from "../../utils/auth/authToken";
import HeaderSearch from "../../features/search/HeaderSearch";
import UserProfileMenu from "../../features/user-profile/UserProfileMenu";

export default function Header() {
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
          <HeaderSearch
            containerClassName={styles.center}
            inputClassName={styles.searchInput}
            iconClassName={styles.searchIcon}
          />

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
              <NavLink
                to="/my-posts"
                className={({ isActive }) =>
                  isActive ? styles.active : undefined
                }
              >
                My Posts
              </NavLink>
              <NavLink
                to="/messages"
                className={({ isActive }) =>
                  isActive ? styles.active : undefined
                }
              >
                Messages
              </NavLink>
              <NavLink
                to="/resolved-items"
                className={({ isActive }) =>
                  isActive ? styles.active : undefined
                }
              >
                Resolve Items
              </NavLink>
            </nav>

            <UserProfileMenu />

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
