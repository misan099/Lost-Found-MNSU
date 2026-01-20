import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiOutlineEye,
  HiOutlineInformationCircle,
  HiOutlineLocationMarker,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineX,
} from "react-icons/hi";
import AdminLayout from "../../components/admin/AdminLayout";
import api from "../../services/api";
import styles from "./AdminFoundItems.module.css";

const resolveFileUrl = (url) => {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  const apiBase = api.defaults.baseURL || "";
  const fileBase = apiBase.replace(/\/api\/?$/, "");
  const normalized = url.startsWith("/") ? url : `/${url}`;
  return `${fileBase}${normalized}`;
};

const formatNepaliDate = (dateString) => {
  if (!dateString) return "-";
  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) return dateString;
  return parsed.toLocaleString("en-NP", {
    timeZone: "Asia/Kathmandu",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const normalizeStatus = (statusValue) => {
  if (!statusValue) return "available";
  const normalized = String(statusValue)
    .toLowerCase()
    .replace(/_/g, "-")
    .trim();
  if (normalized === "claim requested") return "claim-requested";
  if (normalized === "matched") return "verified";
  return normalized;
};

const mapClaimStatus = (statusValue) => {
  if (!statusValue) return "";
  if (statusValue === "Pending Verification") return "claim-requested";
  if (statusValue === "Matched") return "verified";
  if (statusValue === "Awaiting Confirmation") return "verified";
  if (statusValue === "Resolved") return "resolved";
  return "";
};

const formatStatusLabel = (status) => {
  if (status === "claim-requested") return "Claim Requested";
  if (status === "verified") return "Verified";
  if (status === "resolved") return "Resolved";
  return "Available";
};

const getStatusClass = (status) => {
  if (status === "claim-requested") return styles.statusClaimRequested;
  if (status === "verified") return styles.statusVerified;
  if (status === "resolved") return styles.statusResolved;
  return styles.statusAvailable;
};

export default function AdminFoundItems() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewItem, setViewItem] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    category: "",
    location: "",
    dateFound: "",
    description: "",
  });
  const [toast, setToast] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("isAdmin");
    navigate("/admin/login", { replace: true });
  };

  const showToast = (message, variant = "success") => {
    setToast({ message, variant });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const adminToken = localStorage.getItem("adminToken");
      const headers = adminToken
        ? { Authorization: `Bearer ${adminToken}` }
        : undefined;
      const [itemsResponse, claimsResponse] = await Promise.all([
        api.get("/found-items", { headers }),
        api.get("/admin/claims/with-messages", { headers }),
      ]);

      const rawItems = Array.isArray(itemsResponse.data)
        ? itemsResponse.data
        : itemsResponse.data?.items || itemsResponse.data?.foundItems || [];
      const normalizedItems = rawItems.map((item) => ({
        id: item.id,
        name: item.item_name || item.name || "Unnamed item",
        category: item.category || "Other",
        location:
          item.location ||
          item.exact_location ||
          item.area ||
          "Unknown",
        dateFound: item.date_found || item.dateFound || "",
        postedBy:
          item.user?.name ||
          item.user?.username ||
          item.user_id ||
          "Unknown",
        status: normalizeStatus(item.status),
        description:
          item.public_description || item.description || "",
        imageUrl: resolveFileUrl(
          item.image_url ||
            item.image_path ||
            item.imageUrl ||
            item.imagePath ||
            item.image ||
            null
        ),
        raw: item,
      }));

      const rawClaims = Array.isArray(claimsResponse.data)
        ? claimsResponse.data
        : [];
      setItems(normalizedItems);
      setClaims(rawClaims);
    } catch (error) {
      setErrorMessage("Unable to load found items.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const claimsByFoundId = useMemo(() => {
    const map = new Map();
    claims.forEach((claim) => {
      const foundId = claim?.foundItem?.id;
      if (!foundId) return;
      const existing = map.get(foundId);
      if (!existing || Number(claim.id) > Number(existing.id)) {
        map.set(foundId, claim);
      }
    });
    return map;
  }, [claims]);

  const itemsWithClaims = useMemo(
    () =>
      items.map((item) => {
        const claim = claimsByFoundId.get(item.id) || null;
        const claimStatus = mapClaimStatus(claim?.status);
        const derivedStatus = claimStatus || item.status || "available";
        return {
          ...item,
          status: derivedStatus,
          claim,
          ownerConfirmed: Boolean(claim?.ownerConfirmed),
          finderConfirmed: Boolean(claim?.finderConfirmed),
        };
      }),
    [items, claimsByFoundId]
  );

  const categories = useMemo(() => {
    const unique = new Set();
    itemsWithClaims.forEach((item) => {
      if (item.category) unique.add(item.category);
    });
    return ["all", ...Array.from(unique)];
  }, [itemsWithClaims]);

  const filteredItems = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    return itemsWithClaims
      .filter((item) => {
        if (statusFilter !== "all" && item.status !== statusFilter) {
          return false;
        }
        if (
          categoryFilter !== "all" &&
          item.category !== categoryFilter
        ) {
          return false;
        }
        if (!search) return true;
        const haystack = [
          item.name,
          item.location,
          item.postedBy,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(search);
      })
      .sort((a, b) => Number(b.id) - Number(a.id));
  }, [itemsWithClaims, statusFilter, categoryFilter, searchTerm]);

  const openEdit = (item) => {
    setEditItem(item);
    setEditForm({
      name: item.name || "",
      category: item.category || "",
      location: item.location || "",
      dateFound: item.dateFound
        ? new Date(item.dateFound).toISOString().slice(0, 10)
        : "",
      description: item.description || "",
    });
  };

  const closeEdit = () => {
    setEditItem(null);
    setEditForm({
      name: "",
      category: "",
      location: "",
      dateFound: "",
      description: "",
    });
  };

  const saveEdit = async () => {
    if (!editItem) return;
    try {
      const adminToken = localStorage.getItem("adminToken");
      await api.patch(
        `/found-items/${editItem.id}`,
        {
          item_name: editForm.name,
          category: editForm.category,
          location: editForm.location,
          date_found: editForm.dateFound,
          public_description: editForm.description,
        },
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );
      showToast("Found item updated.", "success");
      closeEdit();
      loadData();
    } catch (error) {
      showToast("Unable to update item.", "warning");
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirmModal) return;
    const item = confirmModal;
    const adminToken = localStorage.getItem("adminToken");
    const headers = adminToken
      ? { Authorization: `Bearer ${adminToken}` }
      : undefined;

    try {
      await api.delete(`/found-items/${item.id}`, { headers });
      showToast("Item deleted.", "success");
      setConfirmModal(null);
      loadData();
    } catch (error) {
      showToast("Action failed. Please try again.", "warning");
      setConfirmModal(null);
    }
  };

  return (
    <AdminLayout onLogout={handleLogout}>
      <div className={styles.wrapper}>
        <header className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Manage Found Items</h1>
          <p className={styles.pageSubtitle}>
            Review found item reports and track claim progress.
          </p>
        </header>

        <section className={styles.filtersSection}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel} htmlFor="statusFilter">
              Status
            </label>
            <select
              id="statusFilter"
              className={styles.filterSelect}
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">All</option>
              <option value="available">Available</option>
              <option value="claim-requested">Claim Requested</option>
              <option value="verified">Verified</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel} htmlFor="categoryFilter">
              Category
            </label>
            <select
              id="categoryFilter"
              className={styles.filterSelect}
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === "all" ? "All Categories" : category}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterSearch}>
            <input
              type="text"
              placeholder="Search by item name or location..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
        </section>

        {errorMessage && (
          <div className={styles.errorMessage}>{errorMessage}</div>
        )}

        <div className={styles.itemsContainer}>
          <table className={styles.itemsTable}>
            <thead>
              <tr>
                <th>Image</th>
                <th>Item Details</th>
                <th>Found Location</th>
                <th>Date Found</th>
                <th>Posted By</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className={styles.noItems}>
                    Loading items...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className={styles.noItems}>
                    No items found.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const canEdit = item.status === "available";
                  const rowClass =
                    item.status !== "available" ? styles.rowLocked : "";

                  return (
                    <tr key={item.id} className={rowClass}>
                      <td>
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className={styles.itemImage}
                          />
                        ) : (
                          <div className={styles.itemImagePlaceholder}>
                            <HiOutlineInformationCircle />
                          </div>
                        )}
                      </td>
                      <td>
                        <div className={styles.itemName}>{item.name}</div>
                        <div className={styles.itemCategory}>
                          {item.category}
                        </div>
                      </td>
                      <td>{item.location}</td>
                      <td>{formatNepaliDate(item.dateFound)}</td>
                      <td>{item.postedBy}</td>
                      <td>
                        <span
                          className={`${styles.statusBadge} ${getStatusClass(
                            item.status
                          )}`}
                        >
                          {formatStatusLabel(item.status)}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actionsCell}>
                          <button
                            type="button"
                            className={`${styles.actionBtn} ${styles.btnView}`}
                            onClick={() => setViewItem(item)}
                          >
                            <HiOutlineEye />
                            View
                          </button>

                          {canEdit && (
                            <>
                              <button
                                type="button"
                                className={`${styles.actionBtn} ${styles.btnEdit}`}
                                onClick={() => openEdit(item)}
                              >
                                <HiOutlinePencil />
                                Edit
                              </button>
                              <button
                                type="button"
                                className={`${styles.actionBtn} ${styles.btnDelete}`}
                                onClick={() =>
                                  setConfirmModal(item)
                                }
                              >
                                <HiOutlineTrash />
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {viewItem && (
        <div
          className={styles.modalOverlay}
          onClick={() => setViewItem(null)}
        >
          <div
            className={styles.modalContent}
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Found Item Details</h2>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setViewItem(null)}
              >
                <HiOutlineX />
              </button>
            </div>
            <div className={styles.modalViewBody}>
              {viewItem.imageUrl && (
                <div className={styles.modalMedia}>
                  <img
                    src={viewItem.imageUrl}
                    alt={viewItem.name}
                    className={styles.modalImage}
                  />
                </div>
              )}
              <div className={styles.modalDetails}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Item Name</span>
                  <span className={styles.detailValue}>{viewItem.name}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Category</span>
                  <span className={styles.detailValue}>
                    {viewItem.category}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>
                    <HiOutlineLocationMarker />
                    Location
                  </span>
                  <span className={styles.detailValue}>
                    {viewItem.location}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Date Found</span>
                  <span className={styles.detailValue}>
                    {formatNepaliDate(viewItem.dateFound)}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Posted By</span>
                  <span className={styles.detailValue}>
                    {viewItem.postedBy}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Status</span>
                  <span className={styles.detailValue}>
                    <span
                      className={`${styles.statusBadge} ${getStatusClass(
                        viewItem.status
                      )}`}
                    >
                      {formatStatusLabel(viewItem.status)}
                    </span>
                  </span>
                </div>
                {viewItem.status === "claim-requested" && (
                  <div className={styles.noticeBox}>
                    <HiOutlineInformationCircle
                      className={styles.noticeIcon}
                    />
                    <span>
                      Verification happens in Claims &amp; Verification.
                    </span>
                  </div>
                )}
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Description</span>
                  <span className={styles.detailValue}>
                    {viewItem.description || "-"}
                  </span>
                </div>

                {(viewItem.status === "verified" ||
                  viewItem.status === "resolved") &&
                  viewItem.claim && (
                  <div className={styles.claimSection}>
                    <h3 className={styles.sectionTitle}>Claim Details</h3>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Statement</span>
                      <span className={styles.detailValue}>
                        {viewItem.claim?.claimDetails?.text || "-"}
                      </span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Detail Type</span>
                      <span className={styles.detailValue}>
                        {viewItem.claim?.claimDetails?.type || "-"}
                      </span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Extra Context</span>
                      <span className={styles.detailValue}>
                        {viewItem.claim?.claimDetails?.additionalContext ||
                          "-"}
                      </span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Proof Image</span>
                      <span className={styles.detailValue}>
                        {viewItem.claim?.claimDetails?.proofImageUrl ? (
                          <img
                            src={viewItem.claim.claimDetails.proofImageUrl}
                            alt="Claim proof"
                            className={styles.claimProof}
                          />
                        ) : (
                          "-"
                        )}
                      </span>
                    </div>

                    <div className={styles.confirmationRow}>
                      <div className={styles.confirmationItem}>
                        <span>Owner confirmed</span>
                        <span>
                          {viewItem.ownerConfirmed ? "Yes" : "No"}
                        </span>
                      </div>
                      <div className={styles.confirmationItem}>
                        <span>Finder confirmed</span>
                        <span>
                          {viewItem.finderConfirmed ? "Yes" : "No"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setConfirmModal(null)}
        >
          <div
            className={`${styles.modalContent} ${styles.confirmModal}`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.modalBody}>
              <div className={styles.confirmIcon}>
                <HiOutlineTrash />
              </div>
              <p className={styles.confirmMessage}>
                {`Delete "${confirmModal.name}"? This cannot be undone.`}
              </p>
              <div className={styles.confirmActions}>
                <button
                  type="button"
                  className={`${styles.confirmBtn} ${styles.btnCancel}`}
                  onClick={() => setConfirmModal(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={`${styles.confirmBtn} ${styles.btnConfirm}`}
                  onClick={handleConfirmDelete}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editItem && (
        <div
          className={styles.modalOverlay}
          onClick={() => closeEdit()}
        >
          <div
            className={styles.modalContent}
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Edit Found Item</h2>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => closeEdit()}
              >
                <HiOutlineX />
              </button>
            </div>
            <div className={styles.modalBody}>
              <label className={styles.formLabel}>
                Item Name
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(event) =>
                    setEditForm((prev) => ({
                      ...prev,
                      name: event.target.value,
                    }))
                  }
                />
              </label>
              <label className={styles.formLabel}>
                Category
                <input
                  type="text"
                  value={editForm.category}
                  onChange={(event) =>
                    setEditForm((prev) => ({
                      ...prev,
                      category: event.target.value,
                    }))
                  }
                />
              </label>
              <label className={styles.formLabel}>
                Location
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(event) =>
                    setEditForm((prev) => ({
                      ...prev,
                      location: event.target.value,
                    }))
                  }
                />
              </label>
              <label className={styles.formLabel}>
                Date Found
                <input
                  type="date"
                  value={editForm.dateFound}
                  onChange={(event) =>
                    setEditForm((prev) => ({
                      ...prev,
                      dateFound: event.target.value,
                    }))
                  }
                />
              </label>
              <label className={styles.formLabel}>
                Description
                <textarea
                  rows={4}
                  value={editForm.description}
                  onChange={(event) =>
                    setEditForm((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                />
              </label>
            </div>
            <div className={styles.modalFooter}>
              <button
                type="button"
                className={`${styles.confirmBtn} ${styles.btnCancel}`}
                onClick={() => closeEdit()}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`${styles.confirmBtn} ${styles.btnConfirm}`}
                onClick={saveEdit}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`${styles.toast} ${styles[toast.variant]}`}>
          {toast.message}
        </div>
      )}
    </AdminLayout>
  );
}
