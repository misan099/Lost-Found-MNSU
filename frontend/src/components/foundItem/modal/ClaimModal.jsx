import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./FoundItemModal.module.css";
import {
  HiX,
  HiLocationMarker,
  HiCalendar,
  HiLockClosed,
  HiShieldCheck,
  HiUpload,
} from "react-icons/hi";

export default function FoundItemModal({
  item,
  open,
  onClose,
  onSubmit,
}) {
  const [step, setStep] = useState("details"); // details | claim
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);

  const MIN = 20;

  /* =====================================================
     BODY SCROLL LOCK
  ===================================================== */
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";

    const esc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", esc);

    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", esc);
    };
  }, [open, onClose]);

  /* =====================================================
     RESET STATE WHEN CLOSED
  ===================================================== */
  useEffect(() => {
    if (!open) {
      setStep("details");
      setText("");
      setFile(null);
    }
  }, [open]);

  if (!open || !item) return null;

  const canSubmit = text.trim().length >= MIN;
  const title =
    item.title || item.item_name || "Unnamed Item";

  return createPortal(
    <div
      className={styles.overlay}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={styles.modal}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* =====================================================
            HEADER
        ===================================================== */}
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>
              {step === "details"
                ? "Found Item Details"
                : "Verify Ownership"}
            </h2>

            {step === "claim" && (
              <p className={styles.subtitle}>
                Provide details only the real owner would know.
              </p>
            )}
          </div>

          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close"
          >
            <HiX />
          </button>
        </div>

        {/* =====================================================
            BODY
        ===================================================== */}
        <div className={styles.body}>
          {/* 🔹 CONTEXT (ALWAYS VISIBLE) */}
          <div className={styles.context}>
            <div className={styles.imageBox}>
              {item.image ? (
                <img
                  src={item.image}
                  alt={title}
                  className={styles.image}
                />
              ) : (
                <div className={styles.imagePlaceholder} />
              )}
            </div>

            <div>
              <h3 className={styles.itemTitle}>{title}</h3>
              <p className={styles.category}>
                {item.category}
              </p>
            </div>
          </div>

          {/* ================= DETAILS STEP ================= */}
          {step === "details" && (
            <>
              <div className={styles.infoRow}>
                <HiLocationMarker />
                <div>
                  <strong>Location</strong>
                  <div>{item.location}</div>
                </div>
              </div>

              {item.foundDate && (
                <div className={styles.infoRow}>
                  <HiCalendar />
                  <div>
                    <strong>Date Found</strong>
                    <div>
                      {new Date(
                        item.foundDate
                      ).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              )}

              <div className={styles.section}>
                <h4>Description</h4>
                <p>{item.description}</p>
              </div>

              <div className={styles.privacyBox}>
                <HiLockClosed />
                <p>
                  Some details are hidden to prevent false
                  claims.
                </p>
              </div>
            </>
          )}

          {/* ================= CLAIM STEP ================= */}
          {step === "claim" && (
            <>
              <div className={styles.block}>
                <label className={styles.label}>
                  Describe something unique{" "}
                  <span className={styles.required}>*</span>
                </label>

                <textarea
                  rows={5}
                  className={styles.textarea}
                  value={text}
                  onChange={(e) =>
                    setText(e.target.value)
                  }
                  placeholder="Scratches, wallpaper, contents, marks…"
                />

                <div className={styles.counterRow}>
                  <span>
                    Minimum {MIN} characters
                  </span>
                  <span
                    className={
                      text.length >= MIN
                        ? styles.counterOk
                        : ""
                    }
                  >
                    {text.length} / {MIN}
                  </span>
                </div>
              </div>

              <div className={styles.block}>
                <label className={styles.label}>
                  Proof image (optional)
                </label>

                <label className={styles.uploadBox}>
                  <HiUpload size={28} />
                  <span>Click to upload</span>

                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) =>
                      setFile(e.target.files?.[0] || null)
                    }
                  />
                </label>

                {file && (
                  <div className={styles.fileName}>
                    {file.name}
                  </div>
                )}
              </div>

              <div className={styles.privacyBox}>
                <HiShieldCheck />
                <p>
                  Your information is reviewed only by
                  admins.
                </p>
              </div>
            </>
          )}
        </div>

        {/* =====================================================
            FOOTER
        ===================================================== */}
        <div className={styles.footer}>
          {step === "details" ? (
            <>
              <button
                className={styles.secondary}
                onClick={onClose}
              >
                Close
              </button>

              <button
                className={styles.primary}
                onClick={() => setStep("claim")}
              >
                Claim This Item
              </button>
            </>
          ) : (
            <>
              <button
                className={styles.secondary}
                onClick={() => setStep("details")}
              >
                Back
              </button>

              <button
                className={styles.primary}
                disabled={!canSubmit}
                onClick={() => {
                  onSubmit({
                    found_item_id: item.id,
                    verification_text: text,
                    proof_file: file || null,
                  });
                  onClose();
                }}
              >
                Submit Claim Request
              </button>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
