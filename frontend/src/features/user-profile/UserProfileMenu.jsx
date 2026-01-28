import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUser, logout } from "../../utils/auth/authToken";
import {
  fetchUserProfile,
  updateUserProfile,
} from "./userProfileApi";
import styles from "./UserProfileMenu.module.css";

const buildInitials = (name) => {
  if (!name) return "U";
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || "U";
  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
};

const syncStoredUser = (profile) => {
  const existing = getUser() || {};
  localStorage.setItem(
    "user",
    JSON.stringify({ ...existing, ...profile })
  );
};

export default function UserProfileMenu() {
  const wrapperRef = useRef(null);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [profile, setProfile] = useState(() => getUser());
  const [nameInput, setNameInput] = useState(
    profile?.name || ""
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const handleClick = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () =>
      document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    let active = true;
    const loadProfile = async () => {
      try {
        const data = await fetchUserProfile();
        if (!active) return;
        setProfile(data);
        syncStoredUser(data);
      } catch (err) {
        if (!active) return;
        setProfile((prev) => prev || getUser());
      }
    };

    loadProfile();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setNameInput(profile?.name || "");
  }, [profile?.name]);

  const initials = useMemo(
    () => buildInitials(profile?.name),
    [profile?.name]
  );

  const handleToggle = () => {
    setOpen((prev) => !prev);
  };

  const handleNavigate = (path) => {
    setOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate("/login", { replace: true });
  };

  const handleOpenModal = () => {
    setError("");
    setModalOpen(true);
    setOpen(false);
  };

  const handleCloseModal = () => {
    setError("");
    setNameInput(profile?.name || "");
    setModalOpen(false);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    const trimmed = nameInput.trim();
    if (!trimmed) {
      setError("Name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      const updated = await updateUserProfile({
        name: trimmed,
      });
      setProfile(updated);
      syncStoredUser(updated);
      setModalOpen(false);
    } catch (err) {
      setError("Unable to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.profileWrapper} ref={wrapperRef}>
      <button
        type="button"
        className={styles.profileButton}
        onClick={handleToggle}
        aria-expanded={open}
      >
        <span className={styles.avatar}>
          {profile?.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile?.name || "User"}
              className={styles.avatarImage}
            />
          ) : (
            <span className={styles.avatarInitials}>
              {initials}
            </span>
          )}
        </span>
        <span className={styles.name}>
          {profile?.name || "User"}
        </span>
        <span className={styles.caret} aria-hidden="true"></span>
      </button>

      {open && (
        <div className={styles.menu}>
          <div className={styles.menuHeader}>
            <div className={styles.menuName}>
              {profile?.name || "User"}
            </div>
            {profile?.email && (
              <div className={styles.menuEmail}>
                {profile.email}
              </div>
            )}
          </div>
          <button
            type="button"
            className={styles.menuItem}
            onClick={handleOpenModal}
          >
            Profile
          </button>
          <button
            type="button"
            className={styles.menuItem}
            onClick={() => handleNavigate("/messages")}
          >
            My Claims
          </button>
          <button
            type="button"
            className={styles.menuItem}
            onClick={handleOpenModal}
          >
            Settings
          </button>
          <div className={styles.menuDivider}></div>
          <button
            type="button"
            className={`${styles.menuItem} ${styles.menuItemDanger}`}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      )}

      {modalOpen && (
        <div className={styles.modalOverlay} role="dialog">
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                Update Profile
              </h3>
              <button
                type="button"
                className={styles.modalClose}
                onClick={handleCloseModal}
                aria-label="Close"
              >
                x
              </button>
            </div>
            <form
              className={styles.modalBody}
              onSubmit={handleSave}
            >
              <label className={styles.fieldLabel} htmlFor="name">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                className={styles.fieldInput}
                value={nameInput}
                onChange={(event) =>
                  setNameInput(event.target.value)
                }
              />
              {error && (
                <div className={styles.errorText}>{error}</div>
              )}
              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={handleCloseModal}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.primaryButton}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
