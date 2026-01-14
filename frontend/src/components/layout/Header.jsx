import styles from "./Header.module.css";
import appIcon from "../../assets/icons/appIcon.png";
import profileImage from "../../assets/images/profile.png";

export default function Header() {
  const username = "Prajal Danai";

  return (
    <>
      {/* 🔥 FAKE HEADER (SPACER) */}
      <div className={styles.fakeHeader}></div>

      {/* 🔥 REAL FIXED HEADER */}
      <header className={styles.header}>
        <div className={styles.container}>

          {/* LEFT */}
          <div className={styles.left}>
            <img src={appIcon} alt="App Icon" className={styles.logoImage} />
            <span className={styles.logoText}>Lost &amp; Found</span>
          </div>

          {/* CENTER */}
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
              <a href="#" className={styles.active}>Found Items</a>
              <a href="#">Lost Items</a>
              <a href="#">My Posts</a>
              <a href="#">Messages</a>
              <a href="#">Resolve Items</a>
            </nav>

            <div className={styles.profile}>
              <img src={profileImage} alt="Profile" className={styles.avatar} />
              <span className={styles.username}>{username}</span>
            </div>

            <button className={styles.logout}>Logout</button>
          </div>

        </div>
      </header>
    </>
  );
}
