import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  HiCheckCircle,
  HiExclamation,
  HiUpload,
  HiX,
} from "react-icons/hi";
import { HiOutlineLockClosed } from "react-icons/hi2";
import {
  HiOutlineCalendar,
  HiOutlineLocationMarker,
} from "react-icons/hi";
import api from "../../../services/api";
import styles from "./FoundItemDetailsModal.module.css";

const MIN_CHARS = 50;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const TOAST_DURATION = 4000;

const normalizeStatus = (statusValue) => {
  if (!statusValue) return "";
  return String(statusValue).toLowerCase().replace(/_/g, " ").trim();
};

const formatNepaliTime = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleString("en-NP", {
    timeZone: "Asia/Kathmandu",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export default function FoundItemDetailsModal({
  open,
  item,
  onClose,
  onSuccess,
}) {
  const [step, setStep] = useState("details");
  const [verificationText, setVerificationText] = useState("");
  const [verificationType, setVerificationType] = useState("");
  const [additionalContext, setAdditionalContext] = useState("");
  const [proofFile, setProofFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [submitState, setSubmitState] = useState("idle");
  const [isDragActive, setIsDragActive] = useState(false);
  const [toasts, setToasts] = useState([]);

  const formRef = useRef(null);
  const inputRef = useRef(null);
  const previewUrlRef = useRef("");
  const claimHistoryRef = useRef(new Set());
  const toastTimersRef = useRef([]);

  const title = useMemo(() => {
    if (!item) return "";
    return item.title || item.item_name || item.name || "Unnamed Item";
  }, [item]);

  const normalizedStatus = useMemo(
    () => normalizeStatus(item?.status),
    [item?.status]
  );

  const isClaimed =
    normalizedStatus === "claimed" || item?.hasClaimed === true;
  const hasExistingClaim = Boolean(
    item?.hasClaimed ||
      item?.hasRequestedClaim ||
      item?.userHasClaimed ||
      item?.claimStatus === "pending" ||
      item?.claim_status === "pending" ||
      (item?.id && claimHistoryRef.current.has(item.id))
  );

  const canSubmit =
    verificationText.trim().length >= MIN_CHARS &&
    submitState !== "loading";

  const addToast = useCallback((type, message) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    const timer = setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, TOAST_DURATION);
    toastTimersRef.current.push(timer);
  }, []);

  const setPreviewFromFile = useCallback((file) => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = "";
    }

    if (!file) {
      setPreviewUrl("");
      return;
    }

    const nextUrl = URL.createObjectURL(file);
    previewUrlRef.current = nextUrl;
    setPreviewUrl(nextUrl);
  }, []);

  const resetForm = useCallback(() => {
    setStep("details");
    setVerificationText("");
    setVerificationType("");
    setAdditionalContext("");
    setProofFile(null);
    setPreviewFromFile(null);
    setSubmitState("idle");
    setIsDragActive(false);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, [setPreviewFromFile]);

  useEffect(() => {
    return () => {
      toastTimersRef.current.forEach((timer) => clearTimeout(timer));
      toastTimersRef.current = [];
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = "";
      }
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    resetForm();
  }, [open, item?.id, resetForm]);

  const handleOpenClaim = () => {
    if (isClaimed) {
      addToast("warning", "This item has already been claimed");
      return;
    }
    if (hasExistingClaim) {
      addToast("info", "You have already requested this item");
      return;
    }
    setStep("claim");
  };

  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      addToast("warning", "Please upload a PNG or JPG image.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      addToast("warning", "File must be under 10MB.");
      return;
    }
    setProofFile(file);
    setPreviewFromFile(file);
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    handleFile(file);
  };

  const handleRemoveFile = (event) => {
    event.stopPropagation();
    setProofFile(null);
    setPreviewFromFile(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragActive(false);
    const file = event.dataTransfer.files?.[0] || null;
    handleFile(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!item || submitState === "loading") return;

    const formElement = formRef.current;
    const formData = formElement ? new FormData(formElement) : new FormData();
    const statementValue = formData.get("verification_text");
    const statement =
      typeof statementValue === "string" ? statementValue.trim() : "";
    if (statement.length < MIN_CHARS) {
      addToast(
        "warning",
        `Please provide at least ${MIN_CHARS} characters.`
      );
      setSubmitState("error");
      return;
    }

    const detailTypeValue = formData.get("verification_type");
    const detailType =
      typeof detailTypeValue === "string"
        ? detailTypeValue.trim()
        : "";
    const extraContextValue = formData.get("additional_context");
    const extraContext =
      typeof extraContextValue === "string"
        ? extraContextValue.trim()
        : "";

    if (isClaimed) {
      addToast("warning", "This item has already been claimed");
      return;
    }
    if (hasExistingClaim) {
      addToast("info", "You have already requested this item");
      return;
    }

    setSubmitState("loading");
    try {
      formData.set("found_item_id", item.id);
      formData.set("verification_text", statement);
      if (detailType) {
        formData.set("verification_type", detailType);
      } else {
        formData.delete("verification_type");
      }
      if (extraContext) {
        formData.set("additional_context", extraContext);
      } else {
        formData.delete("additional_context");
      }
      if (!proofFile) {
        formData.delete("proof_image");
      }

      await api.post("/claims", formData);

      if (item?.id) {
        claimHistoryRef.current.add(item.id);
      }
      onClose?.();
      onSuccess?.(item);
      addToast("success", "Claim request submitted successfully");
      resetForm();
    } catch (error) {
      const status = error?.response?.status;
      if (status === 409) {
        addToast("warning", "This item is no longer available for claiming.");
      } else if (status === 401) {
        addToast("warning", "Please log in to claim this item.");
      } else if (status === 400) {
        addToast(
          "warning",
          error?.response?.data?.message ||
            "Please check your claim details."
        );
      } else if (status === 404) {
        addToast(
          "warning",
          error?.response?.data?.message ||
            "Claim service is unavailable. Please try again."
        );
      } else if (!error?.response) {
        addToast("warning", "Something went wrong. Please try again.");
      } else {
        addToast("warning", "Unable to submit claim. Please try again.");
      }
      setSubmitState("error");
    }
  };

  const shouldRenderModal = open && item;
  if (!shouldRenderModal && toasts.length === 0) return null;

  return (
    <>
      {shouldRenderModal && (
        <div
          className={styles.overlay}
          onClick={(event) => {
            if (event.target === event.currentTarget) onClose?.();
          }}
        >
          <div
            className={styles.modal}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className={styles.header}>
              <div className={styles.titleBlock}>
                <h2 className={styles.title}>
                  {step === "details"
                    ? "Found Item Details"
                    : "Verify Ownership"}
                </h2>
                {step === "claim" && (
                  <p className={styles.subtitle}>
                    Please provide details that only the real owner would know.
                  </p>
                )}
              </div>
              <button
                className={styles.closeBtn}
                onClick={onClose}
                aria-label="Close modal"
                type="button"
              >
                <HiX />
              </button>
            </div>

            <div className={styles.body}>
              {step === "details" && (
                <>
                  {item.image && (
                    <div className={styles.imageWrapper}>
                      <img
                        src={item.image}
                        alt={title}
                        className={styles.image}
                      />
                    </div>
                  )}

                  <div className={styles.info}>
                    <h3 className={styles.itemTitle}>{title}</h3>
                    <p className={styles.category}>{item.category}</p>
                    <span className={styles.status}>{item.status}</span>

                    {isClaimed && (
                      <div className={styles.claimWarning}>
                        <HiExclamation className={styles.warningIcon} />
                        <span>This item has already been claimed.</span>
                      </div>
                    )}

                    <div className={styles.infoItem}>
                      <HiOutlineLocationMarker className={styles.infoIcon} />
                      <div>
                        <strong>Location</strong>
                        <div>{item.location}</div>
                      </div>
                    </div>

                    {item.foundDate && (
                      <div className={styles.infoItem}>
                        <HiOutlineCalendar className={styles.infoIcon} />
                        <div>
                          <strong>Date Found</strong>
                          <div>{formatNepaliTime(item.foundDate)}</div>
                        </div>
                      </div>
                    )}

                    <div className={styles.section}>
                      <h4>Description</h4>
                      <p>{item.description}</p>
                    </div>

                    <div className={styles.privacyBox}>
                      <div className={styles.privacyIcon}>
                        <HiOutlineLockClosed />
                      </div>
                      <div>
                        <h5>Privacy Protection</h5>
                        <p>
                          Some details are hidden to protect privacy and
                          prevent false claims.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {step === "claim" && (
                <form
                  ref={formRef}
                  className={styles.claimForm}
                  onSubmit={handleSubmit}
                >
                  <div className={styles.formBlock}>
                    <label className={styles.label} htmlFor="verification-text">
                      Describe something unique about this item
                      <span className={styles.required}>*</span>
                    </label>
                    <textarea
                      id="verification-text"
                      name="verification_text"
                      rows={5}
                      required
                      minLength={MIN_CHARS}
                      className={styles.textarea}
                      placeholder="Items inside the wallet, scratches on the phone, stickers, lock screen wallpaper, hidden marks, etc."
                      value={verificationText}
                      onChange={(event) =>
                        setVerificationText(event.target.value)
                      }
                    />
                    <div className={styles.counterRow}>
                      <span className={styles.counterLabel}>
                        Minimum {MIN_CHARS} characters required
                      </span>
                      <span
                        className={
                          verificationText.trim().length >= MIN_CHARS
                            ? styles.counterOk
                            : ""
                        }
                      >
                        {verificationText.trim().length} / {MIN_CHARS}
                      </span>
                    </div>
                  </div>

                  <div className={styles.formBlock}>
                    <label className={styles.label} htmlFor="verification-type">
                      What type of detail are you providing?
                      <span className={styles.optional}>(Optional)</span>
                    </label>
                    <select
                      id="verification-type"
                      name="verification_type"
                      className={styles.select}
                      value={verificationType}
                      onChange={(event) =>
                        setVerificationType(event.target.value)
                      }
                    >
                      <option value="">Select a type...</option>
                      <option value="inside-contents">Inside contents</option>
                      <option value="physical-marks">
                        Hidden physical marks
                      </option>
                      <option value="customization">
                        Personal customization
                      </option>
                      <option value="serial">
                        Serial / identifier (partial)
                      </option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className={styles.formBlock}>
                    <label className={styles.label} htmlFor="additional-context">
                      Any additional details that may help verification
                      <span className={styles.optional}>(Optional)</span>
                    </label>
                    <textarea
                      id="additional-context"
                      name="additional_context"
                      rows={3}
                      className={styles.textarea}
                      placeholder="When you lost it, where you last used it, or any extra information"
                      value={additionalContext}
                      onChange={(event) =>
                        setAdditionalContext(event.target.value)
                      }
                    />
                  </div>

                  <div className={styles.formBlock}>
                    <label className={styles.label} htmlFor="proof-image">
                      Upload proof image
                      <span className={styles.optional}>(Optional)</span>
                    </label>
                  <div
                      className={`${styles.uploadBox} ${
                        isDragActive ? styles.uploadBoxActive : ""
                      }`}
                      onClick={() => inputRef.current?.click()}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") inputRef.current?.click();
                      }}
                    >
                      <input
                        ref={inputRef}
                        id="proof-image"
                        name="proof_image"
                        type="file"
                        accept="image/png, image/jpeg"
                        className={styles.fileInput}
                        onChange={handleFileChange}
                      />
                      {proofFile ? (
                        <div className={styles.previewArea}>
                          {previewUrl && (
                            <img
                              src={previewUrl}
                              alt={`Preview of ${proofFile.name}`}
                              className={styles.previewImageFull}
                            />
                          )}
                        </div>
                      ) : (
                        <div className={styles.uploadContent}>
                          <HiUpload className={styles.uploadIcon} />
                          <span className={styles.uploadTitle}>
                            Click to upload or drag and drop
                          </span>
                          <span className={styles.uploadHint}>
                            Receipts or photos can help speed up verification
                          </span>
                          <span className={styles.uploadHint}>
                            PNG, JPG up to 10MB
                          </span>
                        </div>
                      )}

                      <div className={styles.uploadFileRow}>
                        {proofFile ? (
                          <>
                            <div className={styles.fileMeta}>
                              <div className={styles.fileLabel}>
                                <HiCheckCircle className={styles.fileIcon} />
                                <span className={styles.fileName}>
                                  {proofFile.name}
                                </span>
                              </div>
                              <span className={styles.fileHint}>
                                Ready to upload
                              </span>
                            </div>
                            <button
                              className={styles.removeFile}
                              type="button"
                              onClick={handleRemoveFile}
                              aria-label="Remove uploaded file"
                            >
                              <HiX />
                            </button>
                          </>
                        ) : (
                          <span className={styles.filePlaceholder}>
                            No file selected
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className={styles.privacyNotice}>
                    <div className={styles.privacyBadge}>
                      <HiCheckCircle />
                    </div>
                    <div>
                      <p className={styles.privacyTitle}>Privacy & Security</p>
                      <p className={styles.privacyText}>
                        This information is reviewed only by the admin. Your
                        details are not shown publicly or shared with other
                        users.
                      </p>
                    </div>
                  </div>
                </form>
              )}
            </div>

            <div className={styles.footer}>
              {step === "details" ? (
                <>
                  <button
                    className={styles.closeAction}
                    onClick={onClose}
                    type="button"
                  >
                    Close
                  </button>
                  <button
                    className={styles.claimAction}
                    onClick={handleOpenClaim}
                    type="button"
                    disabled={isClaimed}
                  >
                    Claim This Item
                  </button>
                </>
              ) : (
                <>
                  <button
                    className={styles.closeAction}
                    onClick={() => setStep("details")}
                    disabled={submitState === "loading"}
                    type="button"
                  >
                    Back
                  </button>
                  <button
                    className={styles.claimAction}
                    type="submit"
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                  >
                    {submitState === "loading"
                      ? "Submitting..."
                      : "Submit Claim Request"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {toasts.length > 0 && (
        <div className={styles.toastStack} role="status" aria-live="polite">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`${styles.toast} ${styles[`toast${toast.type}`]}`}
            >
              {toast.type === "success" ? (
                <HiCheckCircle className={styles.toastIcon} />
              ) : (
                <HiExclamation className={styles.toastIcon} />
              )}
              <span>{toast.message}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
