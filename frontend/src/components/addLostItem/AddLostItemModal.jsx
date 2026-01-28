import { useState, useEffect } from "react";
import styles from "./AddLostItemModal.module.css";
import { addLostItem } from "../../services/api";
import { validateLostItem } from "../../schemas/lost/lostItem.schema";
import { isAuthenticated } from "../../utils/auth/authToken";
import { getAccountStatus } from "../../utils/auth/authApi";

export default function AddLostItemModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    item_name: "",
    category: "",
    area: "",
    exact_location: "",
    date_lost: "",
    time_lost: "",
    public_description: "",
    admin_verification_details: "",
    hidden_marks: "",
    verification_notes: "",
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [accountRestricted, setAccountRestricted] = useState(false);
  const [accountNotice, setAccountNotice] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    const checkAccount = async () => {
      if (!isAuthenticated()) {
        const notice = "Please log in to report a lost item.";
        setAccountRestricted(true);
        setAccountNotice(notice);
        setError(notice);
        return;
      }

      setAccountRestricted(false);
      setAccountNotice("");
      setError("");

      try {
        const status = await getAccountStatus();
        if (
          status?.status === "suspended" ||
          status?.status === "blocked" ||
          status?.status === "restricted"
        ) {
          setAccountRestricted(true);
          const notice =
            status.notice ||
            "Your account is restricted. Please contact support.";
          setAccountNotice(notice);
          setError(notice);
        }
      } catch (err) {
        console.error("Account status check failed:", err);
      }
    };

    checkAccount();
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        setError("Only JPG, PNG, and WEBP images are allowed");
        e.target.value = "";
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError("Image must be less than 10MB");
        e.target.value = "";
        return;
      }
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
      setImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.onerror = () => {
        setImagePreview(null);
      };
      reader.readAsDataURL(file);
      setError("");
    }
  };

  const normalizeDateInput = (value) => {
    if (!value) return value;
    if (value instanceof Date && !isNaN(value)) {
      return value.toISOString().split("T")[0];
    }
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
      const parsed = new Date(trimmed);
      if (!isNaN(parsed)) {
        return parsed.toISOString().split("T")[0];
      }
      return trimmed;
    }
    return value;
  };

  const normalizeDateTimeInput = (dateValue, timeValue) => {
    const normalizedDate = normalizeDateInput(dateValue);
    if (!normalizedDate) return normalizedDate;
    const normalizedTime =
      typeof timeValue === "string" ? timeValue.trim() : "";
    if (!normalizedTime) return normalizedDate;
    const parsed = new Date(`${normalizedDate}T${normalizedTime}`);
    if (Number.isNaN(parsed.getTime())) return normalizedDate;
    return parsed.toISOString();
  };

  const clearImagePreview = () => {
    if (imagePreview && imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    setImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    if (accountRestricted) {
      setError(
        accountNotice ||
          "Your account is restricted. Please contact support."
      );
      return;
    }

    const normalizedFormData = {
      ...formData,
      date_lost: normalizeDateTimeInput(
        formData.date_lost,
        formData.time_lost
      ),
    };

    if (!isAuthenticated()) {
      setError("Please log in to report a lost item.");
      return;
    }

    setLoading(true);

    try {
      const validation = validateLostItem(normalizedFormData);

      if (!validation.success) {
        setFieldErrors(validation.errors);
        setError("Please fix the errors below");
        throw new Error("Validation failed");
      }

      const data = new FormData(e.currentTarget);
      data.set("date_lost", normalizedFormData.date_lost);
      const uploadedFile = data.get("image");
      if (!uploadedFile || uploadedFile.size === 0) {
        data.delete("image");
      }

      await addLostItem(data);

      setFormData({
        item_name: "",
        category: "",
        area: "",
        exact_location: "",
        date_lost: "",
        time_lost: "",
        public_description: "",
        admin_verification_details: "",
        hidden_marks: "",
        verification_notes: "",
      });
      clearImagePreview();
      setFieldErrors({});
      setError("");

      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      if (err.message !== "Validation failed") {
        console.error("Error submitting lost item:", err);

        if (err.response?.status === 401) {
          setError("Please log in to report a lost item.");
        } else if (err.response?.data?.message) {
          setError(err.response.data.message);
        } else {
          setError("Failed to submit. Please try again.");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <h2>Report Lost Item</h2>
            <p>Provide details about the item you lost.</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M6 18L18 6M6 6l12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className={styles.form}
          id="add-lost-item-form"
          encType="multipart/form-data"
        >
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionIcon}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <h3>Public Item Details</h3>
                <p>Visible to all users</p>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="item_name">
                Item Name <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                id="item_name"
                name="item_name"
                value={formData.item_name}
                onChange={handleChange}
                placeholder="e.g., iPhone 13 Pro, Blue Backpack"
                className={fieldErrors.item_name ? styles.inputError : ""}
              />
              {fieldErrors.item_name && (
                <span className={styles.fieldError}>{fieldErrors.item_name}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="category">
                Category <span className={styles.required}>*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={fieldErrors.category ? styles.inputError : ""}
              >
                <option value="">Select Category</option>
                <option value="Electronics">Electronics</option>
                <option value="Documents">Documents</option>
                <option value="Accessories">Accessories</option>
                <option value="Clothing">Clothing</option>
                <option value="Bags">Bags</option>
                <option value="Keys">Keys</option>
                <option value="Jewelry">Jewelry</option>
                <option value="Other">Other</option>
              </select>
              {fieldErrors.category && (
                <span className={styles.fieldError}>{fieldErrors.category}</span>
              )}
            </div>

            <div className={styles.twoCol}>
              <div className={styles.formGroup}>
                <label htmlFor="area">
                  Area / Zone <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  id="area"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  placeholder="e.g., Library, Student Center"
                  className={fieldErrors.area ? styles.inputError : ""}
                />
                {fieldErrors.area && (
                  <span className={styles.fieldError}>{fieldErrors.area}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="date_lost">
                  Date Lost <span className={styles.required}>*</span>
                </label>
                <input
                  type="date"
                  id="date_lost"
                  name="date_lost"
                  value={formData.date_lost}
                  onChange={handleChange}
                  max={new Date().toISOString().split("T")[0]}
                  className={fieldErrors.date_lost ? styles.inputError : ""}
                />
                {fieldErrors.date_lost && (
                  <span className={styles.fieldError}>{fieldErrors.date_lost}</span>
                )}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="time_lost">
                Time Lost <span className={styles.optional}>(Optional)</span>
              </label>
              <input
                type="time"
                id="time_lost"
                name="time_lost"
                value={formData.time_lost}
                onChange={handleChange}
                className={fieldErrors.time_lost ? styles.inputError : ""}
              />
              {fieldErrors.time_lost && (
                <span className={styles.fieldError}>{fieldErrors.time_lost}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="exact_location">
                Exact Location <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                id="exact_location"
                name="exact_location"
                value={formData.exact_location}
                onChange={handleChange}
                placeholder="e.g., Near stairs, 2nd floor, left corner"
                className={fieldErrors.exact_location ? styles.inputError : ""}
              />
              {fieldErrors.exact_location && (
                <span className={styles.fieldError}>
                  {fieldErrors.exact_location}
                </span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="public_description">
                Short Public Description <span className={styles.required}>*</span>
              </label>
              <textarea
                id="public_description"
                name="public_description"
                value={formData.public_description}
                onChange={handleChange}
                rows="3"
                placeholder="General description of the item..."
                className={fieldErrors.public_description ? styles.inputError : ""}
              />
              <p className={styles.warningText}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Avoid including sensitive or unique details here (e.g., contents,
                serial numbers, personal marks).
              </p>
              {fieldErrors.public_description && (
                <span className={styles.fieldError}>
                  {fieldErrors.public_description}
                </span>
              )}
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionIconAlt}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <h3>Item Image</h3>
                <p>Optional but recommended</p>
              </div>
            </div>

            <div className={styles.formGroup}>
              <input
                type="file"
                id="image"
                name="image"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleImageChange}
                className={styles.fileInput}
              />
              <label htmlFor="image" className={styles.uploadBox}>
                {!imagePreview ? (
                  <div className={styles.uploadPlaceholder}>
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>Click to upload or drag and drop</span>
                    <strong>PNG, JPG, WEBP up to 10MB</strong>
                  </div>
                ) : (
                  <div className={styles.previewInside}>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className={styles.imagePreview}
                    />
                    <button
                      type="button"
                      className={styles.removeImageBtn}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        clearImagePreview();
                        document.getElementById("image").value = "";
                      }}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </label>
            </div>
          </div>

          <div className={styles.adminSection}>
            <div className={styles.adminHeader}>
              <div className={styles.adminIcon}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <h3>Admin Verification Details</h3>
                <p>Private - Not Visible to Users</p>
              </div>
            </div>

            <div className={styles.adminNote}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p>
                These details are used <strong>ONLY by admins</strong> to verify
                ownership claims. They will <strong>NOT be shown to users</strong>{" "}
                browsing lost items.
              </p>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="admin_verification_details">
                Unique Identifiers <span className={styles.required}>*</span>
              </label>
              <textarea
                id="admin_verification_details"
                name="admin_verification_details"
                value={formData.admin_verification_details}
                onChange={handleChange}
                rows="4"
                placeholder="Examples: Contents inside wallet, phone wallpaper description, scratches location, stickers, partial serial number..."
                className={
                  fieldErrors.admin_verification_details ? styles.inputError : ""
                }
              />
              <p className={styles.adminHelper}>
                Be as specific as possible. These details help verify real owners.
              </p>
              {fieldErrors.admin_verification_details && (
                <span className={styles.fieldError}>
                  {fieldErrors.admin_verification_details}
                </span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="hidden_marks">
                Hidden Marks or Personal Details{" "}
                <span className={styles.optional}>(Optional)</span>
              </label>
              <textarea
                id="hidden_marks"
                name="hidden_marks"
                value={formData.hidden_marks}
                onChange={handleChange}
                rows="3"
                placeholder="Examples: Torn zipper, cracked corner, initials written inside, specific wear patterns..."
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="verification_notes">
                Verification Notes{" "}
                <span className={styles.optional}>(Optional)</span>
              </label>
              <textarea
                id="verification_notes"
                name="verification_notes"
                value={formData.verification_notes}
                onChange={handleChange}
                rows="3"
                placeholder="Any additional observations that might help verify the owner..."
              />
            </div>
          </div>

          <div className={styles.privacyBox}>
            <div className={styles.privacyIcon}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <p>Privacy &amp; Security Guarantee</p>
              <span>
                Private verification details are securely stored and visible only
                to admins. They help prevent false claims and ensure items reach
                their rightful owners.
              </span>
            </div>
          </div>
        </form>

        <div className={styles.actions}>
          <button
            type="button"
            onClick={onClose}
            className={styles.cancelBtn}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading || accountRestricted}
            form="add-lost-item-form"
          >
            {loading ? "Submitting..." : "Save Lost Item"}
          </button>
        </div>
      </div>
    </div>
  );
}
