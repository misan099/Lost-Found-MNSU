import { useEffect, useRef, useState } from "react";
import { HiOutlineBell } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import useAdminNotifications from "./useAdminNotifications";
import styles from "./AdminNotifications.module.css";

export default function AdminNotifications() {
  const navigate = useNavigate();
  const wrapperRef = useRef(null);
  const [open, setOpen] = useState(false);
  const { data, loading, errorMessage } = useAdminNotifications();

  const badgeCount = data?.badgeCount || 0;
  const items = data?.items || [];

  useEffect(() => {
    const handler = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleItemClick = (route) => {
    setOpen(false);
    if (route) {
      navigate(route);
    }
  };

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <button
        type="button"
        className={styles.button}
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Notifications"
      >
        <HiOutlineBell />
        {badgeCount > 0 && (
          <span className={styles.badge}>{badgeCount}</span>
        )}
      </button>

      {open && (
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <span>Notifications</span>
            {loading && <span className={styles.panelMeta}>Updating...</span>}
          </div>
          {errorMessage ? (
            <div className={styles.panelEmpty}>{errorMessage}</div>
          ) : items.length === 0 ? (
            <div className={styles.panelEmpty}>No updates right now.</div>
          ) : (
            <div className={styles.panelList}>
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={styles.panelItem}
                  onClick={() => handleItemClick(item.route)}
                >
                  <div>
                    <div className={styles.itemTitle}>{item.title}</div>
                    <div className={styles.itemDesc}>{item.description}</div>
                  </div>
                  <span
                    className={`${styles.itemCount} ${styles[item.tone] || ""}`}
                  >
                    {item.count}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
