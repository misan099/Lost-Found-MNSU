import { useMemo, useRef, useState } from "react";
import styles from "./LostItemCard.module.css";
import {
  HiOutlineLocationMarker,
  HiOutlineCalendar,
} from "react-icons/hi";
import api from "../../services/api";

export default function LostItemCard({ item, onViewDetails }) {
  const imgRef = useRef(null);
  const [zoomed, setZoomed] = useState(false);

  /* =========================
     DATE FORMATTER (NEPAL TIME)
  ========================== */
  const formatNepaliTime = (dateString) => {
    if (!dateString) return "";
    const normalized = String(dateString).trim();
    if (!normalized) return "";
    const parsed = new Date(normalized);
    if (Number.isNaN(parsed.getTime())) return normalized;

    const baseOptions = {
      timeZone: "Asia/Kathmandu",
      year: "numeric",
      month: "long",
      day: "numeric",
    };

    const timeMatch = normalized.match(
      /(?:T|\s)(\d{2}):(\d{2})(?::(\d{2}))?/
    );
    const hasMeaningfulTime = timeMatch
      ? timeMatch.slice(1).some((part) => part && part !== "00")
      : false;

    if (!hasMeaningfulTime) {
      return parsed.toLocaleDateString("en-NP", baseOptions);
    }

    return parsed.toLocaleString("en-NP", {
      ...baseOptions,
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  /* =========================
     STATUS BADGES
  ========================== */
  const statusClassMap = {
    Available: styles.badgeAvailable,
    "Claim Requested": styles.badgeClaimRequested,
    Verified: styles.badgeVerified,
    Returned: styles.badgeReturned,
  };

  const statusClassName =
    statusClassMap[item.status] || styles.badgeDefault;

  const mediaClassName =
    item.mediaVariant === "amber"
      ? styles.mediaAmber
      : styles.mediaSlate;

  const imageSrc = useMemo(() => {
    const rawPath =
      item?.image ||
      item?.image_url ||
      item?.imageUrl ||
      item?.image_path ||
      item?.imagePath ||
      null;
    if (!rawPath) return "";
    if (typeof rawPath === "string" && rawPath.startsWith("http")) {
      return rawPath;
    }
    const apiBase = api.defaults.baseURL || "";
    const fileBase = apiBase.replace(/\/api\/?$/, "");
    return `${fileBase}${rawPath}`;
  }, [item]);

  /* =========================
     IMAGE ZOOM HANDLERS
  ========================== */
  const handleMove = (e) => {
    if (!zoomed || !imgRef.current) return;

    const rect = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    imgRef.current.style.transformOrigin = `${x}% ${y}%`;
  };

  const handleTouchMove = (e) => {
    if (!zoomed || !imgRef.current) return;

    const touch = e.touches[0];
    const rect = imgRef.current.getBoundingClientRect();
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;

    imgRef.current.style.transformOrigin = `${x}% ${y}%`;
  };

  return (
    <article className={styles.card}>
      {/* =========================
          IMAGE / STATUS BADGE
      ========================== */}
      <div
        className={`${styles.media} ${mediaClassName}`}
        onMouseEnter={() => setZoomed(true)}
        onMouseLeave={() => setZoomed(false)}
        onMouseMove={handleMove}
        onTouchStart={() => setZoomed(true)}
        onTouchEnd={() => setZoomed(false)}
        onTouchMove={handleTouchMove}
      >
        {imageSrc ? (
          <img
            ref={imgRef}
            className={`${styles.mediaImage} ${
              zoomed ? styles.zoomed : ""
            }`}
            src={imageSrc}
            alt={item.title}
          />
        ) : (
          <div className={styles.mediaPlaceholder} />
        )}

        <span className={`${styles.badge} ${statusClassName}`}>
          {item.status}
        </span>
      </div>

      {/* =========================
          CONTENT
      ========================== */}
      <div className={styles.content}>
        <h3 className={styles.title}>{item.title}</h3>
        <p className={styles.category}>{item.category}</p>

        <div className={styles.meta}>
          {/* Location */}
          <div className={`${styles.metaRow} ${styles.locationRow}`}>
            <span className={styles.iconWrapper}>
              <HiOutlineLocationMarker className={styles.metaIcon} />
            </span>
            <span className={styles.metaText}>
              {item.location}
            </span>
          </div>

          {/* Lost Date */}
          <div className={`${styles.metaRow} ${styles.dateRow}`}>
            <span className={styles.iconWrapper}>
              <HiOutlineCalendar className={styles.metaIcon} />
            </span>
            <span className={styles.metaText}>
              {formatNepaliTime(item.lostDate)}
            </span>
          </div>
        </div>

        {/* VIEW DETAILS BUTTON */}
        <button
          type="button"
          className={styles.viewButton}
          onClick={() => {
            console.log("Button clicked", item);
            if (onViewDetails) {
              onViewDetails(item);
            }
          }}
        >
          View Details
        </button>
      </div>
    </article>
  );
}
