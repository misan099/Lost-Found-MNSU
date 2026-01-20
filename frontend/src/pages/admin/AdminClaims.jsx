import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiOutlineLocationMarker,
  HiOutlinePhotograph,
  HiX,
} from "react-icons/hi";
import { HiOutlineLockClosed } from "react-icons/hi2";
import AdminLayout from "../../components/admin/AdminLayout";
import api from "../../services/api";
import styles from "./AdminClaims.module.css";

const resolveFileUrl = (url) => {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  const apiBase = api.defaults.baseURL || "";
  const fileBase = apiBase.replace(/\/api\/?$/, "");
  const normalized = url.startsWith("/") ? url : `/${url}`;
  return `${fileBase}${normalized}`;
};

const formatNepaliTime = (dateString) => {
  if (!dateString) return "\u2014";
  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) return dateString;
  return parsed.toLocaleString("en-NP", {
    timeZone: "Asia/Kathmandu",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const normalizeAdminStatus = (statusValue) => {
  if (!statusValue) return "Pending Verification";
  const normalized = String(statusValue)
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (normalized === "pending") return "Pending Verification";
  if (normalized === "pending verification") return "Pending Verification";
  if (normalized === "awaiting confirmation") return "Awaiting Resolution";
  if (normalized === "awaiting admin resolution") return "Awaiting Resolution";
  if (normalized === "awaiting resolution") return "Awaiting Resolution";
  if (normalized === "matched") return "Verified";
  if (normalized === "verified") return "Verified";
  if (normalized === "resolved") return "Resolved";
  if (normalized === "rejected") return "Rejected";
  return statusValue;
};

const getDisplayStatus = (claim) => {
  const normalized = normalizeAdminStatus(claim?.status);
  const bothConfirmed =
    Boolean(claim?.ownerConfirmed) && Boolean(claim?.finderConfirmed);
  if (normalized === "Verified" && bothConfirmed) {
    return "Awaiting Resolution";
  }
  return normalized;
};

const formatClaimTypeLabel = (value) => {
  if (!value) return "\u2014";
  const normalized = String(value)
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .trim();
  if (!normalized) return "\u2014";
  return normalized.replace(/\b\w/g, (char) => char.toUpperCase());
};

export default function AdminClaims() {
  const navigate = useNavigate();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewModal, setViewModal] = useState(null);
  const [claimModal, setClaimModal] = useState(null);
  const [verifyTarget, setVerifyTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [resolveTarget, setResolveTarget] = useState(null);
  const [verifyNote, setVerifyNote] = useState("");
  const [rejectNote, setRejectNote] = useState("");
  const [zoomImage, setZoomImage] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("isAdmin");

    navigate("/admin/login", { replace: true });
  };

  useEffect(() => {
    let isMounted = true;

    const fetchClaims = async () => {
      setLoading(true);
      setErrorMessage("");
      try {
        const adminToken = localStorage.getItem("adminToken");
        const response = await api.get(
          "/admin/claims/with-messages",
          {
            headers: {
              Authorization: `Bearer ${adminToken}`,
            },
          }
        );
        const data = Array.isArray(response?.data)
          ? response.data
          : [];
        const mappedClaims = data.map((claim) => {
          const ownerConfirmed = Boolean(claim?.ownerConfirmed);
          const finderConfirmed = Boolean(claim?.finderConfirmed);
          const derivedStatus = getDisplayStatus({
            status: claim?.status,
            ownerConfirmed,
            finderConfirmed,
          });
          const claimType =
            claim?.claimType ||
            (claim?.foundItem?.id ? "found" : "lost");

          const normalizedAdminDetails = (() => {
            if (
              claim?.foundItem?.adminDetails &&
              typeof claim.foundItem.adminDetails === "object"
            ) {
              return claim.foundItem.adminDetails;
            }
            if (typeof claim?.foundItem?.adminDetails === "string") {
              return {
                verificationDetails: claim.foundItem.adminDetails,
              };
            }
            return null;
          })();

          const rawClaimDetails = claim?.claimDetails || {};
          const claimDetails = {
            text:
              rawClaimDetails.text ??
              claim?.verification_text ??
              null,
            type:
              rawClaimDetails.type ??
              claim?.verification_type ??
              null,
            additionalContext:
              rawClaimDetails.additionalContext ??
              claim?.additional_context ??
              null,
            proofImageUrl: resolveFileUrl(
              rawClaimDetails.proofImageUrl ??
                claim?.proof_image_url ??
                null
            ),
          };

          return {
            id: claim?.id,
            status: derivedStatus,
            claimType,
            ownerConfirmed,
            finderConfirmed,
            createdAt: claim?.created_at || claim?.createdAt || null,
            claimDetails,
            lostItem: {
              id: claim?.lostItem?.id ?? null,
              name: claim?.lostItem?.name ?? null,
              category: claim?.lostItem?.category ?? null,
              area: claim?.lostItem?.area ?? null,
              exactLocation: claim?.lostItem?.exactLocation ?? null,
              publicDescription:
                claim?.lostItem?.publicDescription ??
                claim?.lostItem?.description ??
                null,
              location: claim?.lostItem?.location ?? null,
              ownerName:
                claim?.lostOwner?.name ??
                claim?.lostOwner?.full_name ??
                null,
              description: claim?.lostItem?.description ?? null,
              date: claim?.lostItem?.date ?? null,
              image: resolveFileUrl(
                claim?.lostItem?.imageUrl ??
                  claim?.lostItem?.image_url ??
                  claim?.lostItem?.imagePath ??
                  claim?.lostItem?.image_path ??
                  claim?.lostItem?.image ??
                  null
              ),
              adminDetails: claim?.lostItem?.adminDetails ?? null,
            },
            foundItem: {
              id: claim?.foundItem?.id ?? null,
              name: claim?.foundItem?.name ?? null,
              category: claim?.foundItem?.category ?? null,
              area: claim?.foundItem?.area ?? null,
              exactLocation: claim?.foundItem?.exactLocation ?? null,
              publicDescription:
                claim?.foundItem?.publicDescription ??
                claim?.foundItem?.description ??
                null,
              location: claim?.foundItem?.location ?? null,
              ownerName:
                claim?.foundOwner?.name ??
                claim?.foundOwner?.full_name ??
                claim?.finder?.name ??
                null,
              description: claim?.foundItem?.description ?? null,
              date: claim?.foundItem?.date ?? null,
              image: resolveFileUrl(
                claim?.foundItem?.imageUrl ??
                  claim?.foundItem?.image_url ??
                  claim?.foundItem?.imagePath ??
                  claim?.foundItem?.image_path ??
                  claim?.foundItem?.image ??
                  null
              ),
              adminDetails: normalizedAdminDetails,
            },
          };
        });

        console.log("Mapped claims:", mappedClaims);

        if (isMounted) {
          setClaims(mappedClaims);
        }
      } catch (error) {
        console.error("Admin claims fetch error:", error);
        if (isMounted) {
          setErrorMessage("Unable to load claims.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchClaims();

    return () => {
      isMounted = false;
    };
  }, []);

  const getClaimType = (claim) =>
    claim?.claimType || (claim?.foundItem?.id ? "found" : "lost");

  const filteredClaims = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return claims
      .filter((claim) => {
        const status = getDisplayStatus(claim);
        const allowedStatuses = [
          "Pending Verification",
          "Rejected",
          "Verified",
          "Awaiting Resolution",
          "Resolved",
        ];
        if (!allowedStatuses.includes(status)) return false;

        if (statusFilter !== "All" && status !== statusFilter) {
          return false;
        }

        if (!normalizedSearch) return true;

        const haystack = [
          claim?.id,
          claim?.lostItem?.name,
          claim?.foundItem?.name,
          claim?.lostItem?.ownerName,
          claim?.foundItem?.ownerName,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(normalizedSearch);
      })
      .sort((a, b) => Number(a.id || 0) - Number(b.id || 0));
  }, [claims, searchTerm, statusFilter]);

  const handleVerify = async () => {
    if (!verifyTarget) return;

    try {
      const adminToken = localStorage.getItem("adminToken");
      const note = verifyNote.trim();
      await api.patch(
        `/admin/claims/${verifyTarget.id}/verify`,
        { note },
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      setClaims((prev) =>
        prev.map((claim) =>
          claim.id === verifyTarget.id
            ? { ...claim, status: "Verified" }
            : claim
        )
      );
      setVerifyTarget(null);
      setVerifyNote("");
    } catch (error) {
      setErrorMessage("Unable to verify claim.");
    }
  };

  const handleReject = async () => {
    if (!rejectTarget) return;

    try {
      const adminToken = localStorage.getItem("adminToken");
      const note = rejectNote.trim();
      await api.patch(
        `/admin/claims/${rejectTarget.id}/reject`,
        { note },
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      setClaims((prev) =>
        prev.map((claim) =>
          claim.id === rejectTarget.id
            ? { ...claim, status: "Rejected" }
            : claim
        )
      );
      setRejectTarget(null);
      setRejectNote("");
    } catch (error) {
      setErrorMessage("Unable to reject claim.");
    }
  };

  const handleResolve = async () => {
    if (!resolveTarget) return;

    try {
      const adminToken = localStorage.getItem("adminToken");
      await api.post(
        `/admin/claims/${resolveTarget.id}/resolve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      setClaims((prev) =>
        prev.map((claim) =>
          claim.id === resolveTarget.id
            ? { ...claim, status: "Resolved" }
            : claim
        )
      );
      setResolveTarget(null);
    } catch (error) {
      setErrorMessage("Unable to resolve claim.");
    }
  };

  return (
    <AdminLayout onLogout={handleLogout}>
      <div className={styles.wrapper}>
        <div className={styles.container}>
          <header className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>Claims &amp; Verification</h1>
            <p className={styles.subtitle}>
              Admin-controlled claim matching and verification
            </p>
          </header>

          <div className={styles.controlsBar}>
            <div className={styles.controlGroup}>
              <label className={styles.controlLabel} htmlFor="statusFilter">
                Filter by Status
              </label>
              <select
                id="statusFilter"
                className={styles.controlInput}
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="All">All Claims</option>
                <option value="Pending Verification">
                  Pending Verification
                </option>
                <option value="Verified">Verified</option>
                <option value="Awaiting Resolution">
                  Awaiting Resolution
                </option>
                <option value="Rejected">Rejected</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>

            <div className={styles.controlGroup}>
              <label className={styles.controlLabel} htmlFor="searchInput">
                Search Claims
              </label>
              <input
                id="searchInput"
                type="text"
                className={`${styles.controlInput} ${styles.searchInput}`}
                placeholder="Search by item name or owner..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
          </div>

          {errorMessage && (
            <div className={styles.errorMessage}>{errorMessage}</div>
          )}

          <div className={styles.claimsTableContainer}>
            <table className={styles.table}>
              <thead className={styles.tableHead}>
                <tr>
                  <th className={styles.tableHeaderCell}>Claim ID</th>
                  <th className={styles.tableHeaderCell}>Lost Item</th>
                  <th className={styles.tableHeaderCell}>Found Item</th>
                  <th className={styles.tableHeaderCell}>Lost Owner</th>
                  <th className={styles.tableHeaderCell}>Found Owner</th>
                  <th className={styles.tableHeaderCell}>Status</th>
                  <th className={styles.tableHeaderCell}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr className={styles.tableRow}>
                    <td className={styles.tableCell} colSpan={7}>
                      <div className={styles.noClaims}>
                        Loading claims...
                      </div>
                    </td>
                  </tr>
                ) : filteredClaims.length === 0 ? (
                  <tr className={styles.tableRow}>
                    <td className={styles.tableCell} colSpan={7}>
                      <div className={styles.noClaims}>
                        No claims found
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredClaims.map((claim) => {
                    const label = getDisplayStatus(claim);
                    const isPending = label === "Pending Verification";
                    const isAwaiting =
                      label === "Awaiting Resolution";
                    const statusClass =
                      label === "Pending Verification"
                        ? styles.statusPending
                        : label === "Verified"
                          ? styles.statusVerified
                          : label === "Awaiting Resolution"
                            ? styles.statusAwaiting
                            : label === "Resolved"
                              ? styles.statusResolved
                              : styles.statusRejected;
                    const claimType = getClaimType(claim);
                    const showLostButton =
                      claimType === "lost" && claim?.lostItem?.id;
                    const showFoundButton =
                      claimType === "found" && claim?.foundItem?.id;

                    return (
                      <tr key={claim.id} className={styles.tableRow}>
                        <td className={styles.tableCell}>
                          <strong>{claim.id}</strong>
                        </td>
                        <td className={styles.tableCell}>
                          <div className={styles.itemInfo}>
                            <div className={styles.itemName}>
                              {claim?.lostItem?.name || "\u2014"}
                            </div>
                            <div className={styles.itemLocation}>
                              <HiOutlineLocationMarker
                                className={styles.locationIcon}
                              />
                              {claim?.lostItem?.location || "\u2014"}
                            </div>
                          </div>
                        </td>
                        <td className={styles.tableCell}>
                          <div className={styles.itemInfo}>
                            <div className={styles.itemName}>
                              {claim?.foundItem?.name || "\u2014"}
                            </div>
                            <div className={styles.itemLocation}>
                              <HiOutlineLocationMarker
                                className={styles.locationIcon}
                              />
                              {claim?.foundItem?.location || "\u2014"}
                            </div>
                          </div>
                        </td>
                        <td className={styles.tableCell}>
                          <span className={styles.ownerName}>
                            {claim?.lostItem?.ownerName || "\u2014"}
                          </span>
                        </td>
                        <td className={styles.tableCell}>
                          <span className={styles.ownerName}>
                            {claim?.foundItem?.ownerName || "\u2014"}
                          </span>
                        </td>
                        <td className={styles.tableCell}>
                          <span
                            className={`${styles.statusBadge} ${statusClass}`}
                          >
                            {label}
                          </span>
                        </td>
                        <td className={styles.tableCell}>
                          <div className={styles.actionButtons}>
                            {showLostButton && (
                              <button
                                type="button"
                                className={`${styles.button} ${styles.buttonInfo} ${styles.actionButtonLarge}`}
                                onClick={() =>
                                  setViewModal({ type: "lost", claim })
                                }
                              >
                                View Lost
                              </button>
                            )}
                            {showFoundButton && (
                              <button
                                type="button"
                                className={`${styles.button} ${styles.buttonInfo} ${styles.actionButtonLarge}`}
                                onClick={() =>
                                  setViewModal({ type: "found", claim })
                                }
                              >
                                View Found
                              </button>
                            )}
                            <button
                              type="button"
                              className={`${styles.button} ${styles.buttonInfo} ${styles.actionButtonLarge}`}
                              onClick={() => setClaimModal(claim)}
                            >
                              View Claim
                            </button>
                            <button
                              type="button"
                              className={`${styles.button} ${styles.buttonSuccess} ${styles.actionButtonLarge}`}
                              onClick={() => setResolveTarget(claim)}
                              disabled={!isAwaiting}
                            >
                              Resolve
                            </button>
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
      </div>

      {viewModal && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modalContent} ${styles.viewModal}`}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {viewModal.type === "lost"
                  ? "Lost Item Details"
                  : "Found Item Details"}
              </h3>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setViewModal(null)}
              >
                <HiX />
              </button>
            </div>
            <div className={styles.viewModalBody}>
              {(() => {
                const item =
                  viewModal.type === "lost"
                    ? viewModal.claim?.lostItem
                    : viewModal.claim?.foundItem;
                const adminDetails = item?.adminDetails || {};
                const title = item?.name || "Unnamed item";
                const category = item?.category || "\u2014";
                const area = item?.area || "\u2014";
                const exactLocation = item?.exactLocation || "\u2014";
                const location = item?.location || "\u2014";
                const dateLabel =
                  viewModal.type === "lost" ? "Date Lost" : "Date Found";
                const description =
                  item?.publicDescription || item?.description || "\u2014";

                return (
                  <>
                    <div className={styles.viewImageCard}>
                      {item?.image ? (
                        <img
                          className={styles.viewImage}
                          src={item.image}
                          alt={title}
                          onClick={() => setZoomImage(item.image)}
                        />
                      ) : (
                        <div className={styles.viewImagePlaceholder}>
                          <HiOutlinePhotograph />
                          <span>No image provided</span>
                        </div>
                      )}
                    </div>

                    <div className={styles.viewSection}>
                      <h4 className={styles.viewSectionTitle}>
                        Reported Details
                      </h4>
                      <div className={styles.viewField}>
                        <span className={styles.viewLabel}>
                          Item name / category
                        </span>
                        <span className={styles.viewValue}>
                          {title}
                          <span className={styles.viewMuted}>
                            {` \u2022 ${category}`}
                          </span>
                        </span>
                      </div>
                      <div className={styles.viewField}>
                        <span className={styles.viewLabel}>Area</span>
                        <span className={styles.viewValue}>{area}</span>
                      </div>
                      <div className={styles.viewField}>
                        <span className={styles.viewLabel}>
                          Exact location
                        </span>
                        <span className={styles.viewValue}>
                          {exactLocation}
                        </span>
                      </div>
                      <div className={styles.viewField}>
                        <span className={styles.viewLabel}>Location</span>
                        <span className={styles.viewValue}>{location}</span>
                      </div>
                      <div className={styles.viewField}>
                        <span className={styles.viewLabel}>{dateLabel}</span>
                        <span className={styles.viewValue}>
                          {formatNepaliTime(item?.date)}
                        </span>
                      </div>
                      <div className={styles.viewField}>
                        <span className={styles.viewLabel}>
                          Public description
                        </span>
                        <span className={styles.viewValue}>{description}</span>
                      </div>
                    </div>

                    <div className={styles.viewAdminBlock}>
                      <div className={styles.viewAdminHeader}>
                        <HiOutlineLockClosed />
                        <span>
                          Admin Only – Not Visible to Users
                        </span>
                      </div>
                      <div className={styles.viewField}>
                        <span className={styles.viewLabel}>
                          Unique identifiers
                        </span>
                        <span className={styles.viewValue}>
                          {adminDetails?.verificationDetails || "\u2014"}
                        </span>
                      </div>
                      <div className={styles.viewField}>
                        <span className={styles.viewLabel}>
                          Hidden marks / personal details
                        </span>
                        <span className={styles.viewValue}>
                          {adminDetails?.hiddenMarks || "\u2014"}
                        </span>
                      </div>
                      <div className={styles.viewField}>
                        <span className={styles.viewLabel}>
                          Extra notes / context
                        </span>
                        <span className={styles.viewValue}>
                          {adminDetails?.notes || "\u2014"}
                        </span>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {verifyTarget && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Verify Claim</h3>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => {
                  setVerifyTarget(null);
                  setVerifyNote("");
                }}
              >
                <HiX />
              </button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.confirmText}>
                Verify claim {verifyTarget.id}? This approves the claim and
                enables messaging between users.
              </p>
              <label className={styles.controlLabel} htmlFor="verifyNote">
                Admin note (optional)
              </label>
              <textarea
                id="verifyNote"
                className={styles.textArea}
                rows={3}
                value={verifyNote}
                onChange={(event) => setVerifyNote(event.target.value)}
                placeholder="Optional note for this verification..."
              />
            </div>
            <div className={styles.modalFooter}>
              <button
                type="button"
                className={`${styles.button} ${styles.buttonInfo}`}
                onClick={() => {
                  setVerifyTarget(null);
                  setVerifyNote("");
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`${styles.button} ${styles.buttonSuccess}`}
                onClick={handleVerify}
              >
                Confirm Verify
              </button>
            </div>
          </div>
        </div>
      )}

      {rejectTarget && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Reject Claim</h3>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => {
                  setRejectTarget(null);
                  setRejectNote("");
                }}
              >
                <HiX />
              </button>
            </div>
            <div className={styles.modalBody}>
              <label className={styles.controlLabel} htmlFor="rejectNote">
                Admin note (optional)
              </label>
              <textarea
                id="rejectNote"
                className={styles.textArea}
                rows={4}
                value={rejectNote}
                onChange={(event) => setRejectNote(event.target.value)}
                placeholder="Optional note for this rejection..."
              />
            </div>
            <div className={styles.modalFooter}>
              <button
                type="button"
                className={`${styles.button} ${styles.buttonInfo}`}
                onClick={() => {
                  setRejectTarget(null);
                  setRejectNote("");
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`${styles.button} ${styles.buttonDanger}`}
                onClick={handleReject}
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {resolveTarget && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Resolve Claim</h3>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setResolveTarget(null)}
              >
                <HiX />
              </button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.confirmText}>
                Resolve claim {resolveTarget.id}? This will close the chat and
                move the item to Resolved Items.
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button
                type="button"
                className={`${styles.button} ${styles.buttonInfo}`}
                onClick={() => setResolveTarget(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`${styles.button} ${styles.buttonSuccess}`}
                onClick={handleResolve}
              >
                Confirm Resolve
              </button>
            </div>
          </div>
        </div>
      )}

      {claimModal && (
        <div className={styles.modalOverlay}>
          <div
            className={`${styles.modalContent} ${styles.claimModal}`}
          >
            <div className={styles.modalHeader}>
              <h3
                className={`${styles.modalTitle} ${styles.claimModalTitle}`}
              >
                Claim Comparison
              </h3>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setClaimModal(null)}
              >
                <HiX />
              </button>
            </div>
            <div className={styles.claimModalBody}>
              {(() => {
                const claimType = getClaimType(claimModal);
                const item =
                  claimType === "found"
                    ? claimModal?.foundItem
                    : claimModal?.lostItem;
                const adminDetails = item?.adminDetails || {};
                const claimDetails = claimModal?.claimDetails || {};
                const itemTitle =
                  item?.name || "Unnamed item";
                const itemCategory = item?.category || "\u2014";
                const itemLocation = item?.location || "\u2014";
                const itemDate = item?.date || null;
                const proofImage = claimDetails?.proofImageUrl || null;
                const claimDate =
                  claimModal?.createdAt ||
                  claimModal?.created_at ||
                  claimModal?.claimDetails?.createdAt ||
                  claimModal?.claimDetails?.created_at ||
                  null;
                const claimStatement =
                  claimDetails?.text || "\u2014";
                const claimDetailType = formatClaimTypeLabel(
                  claimDetails?.type
                );
                const claimContext =
                  claimDetails?.additionalContext || "\u2014";
                const adminIdentifiers =
                  adminDetails?.verificationDetails || "\u2014";
                const adminMarks = adminDetails?.hiddenMarks || "\u2014";
                const adminNotes = adminDetails?.notes || "\u2014";

                return (
                  <>
                    <div className={styles.claimColumn}>
                      <h4 className={styles.claimColumnTitle}>
                        {claimType === "found"
                          ? "Found Item Details"
                          : "Lost Item Details"}
                      </h4>
                      <div className={styles.claimImageCard}>
                        {item?.image ? (
                          <img
                            src={item.image}
                            alt={itemTitle}
                            className={styles.claimImage}
                            onClick={() => setZoomImage(item.image)}
                          />
                        ) : (
                          <div className={styles.imagePlaceholder}>
                            <HiOutlinePhotograph />
                            <span>No image provided</span>
                          </div>
                        )}
                      </div>

                      <div className={styles.fieldGroup}>
                        <span className={styles.fieldLabel}>
                          Item name / category
                        </span>
                        <span className={styles.fieldValue}>
                          {itemTitle}
                          <span className={styles.fieldMuted}>
                            {` \u2022 ${itemCategory}`}
                          </span>
                        </span>
                      </div>

                      <div className={styles.fieldGroup}>
                        <span className={styles.fieldLabel}>Location</span>
                        <span className={styles.fieldValue}>
                          {itemLocation}
                        </span>
                      </div>

                      <div className={styles.fieldGroup}>
                        <span className={styles.fieldLabel}>Date</span>
                        <span className={styles.fieldValue}>
                          {formatNepaliTime(itemDate)}
                        </span>
                      </div>

                      <div className={styles.adminOnlyBlock}>
                        <div className={styles.detailBlockTitle}>
                          Verification Details
                        </div>
                        <div className={styles.adminOnlyHeader}>
                          <HiOutlineLockClosed />
                          <span>
                            Admin Only – Not Visible to Users
                          </span>
                        </div>
                        <div className={styles.fieldGroup}>
                          <span className={styles.fieldLabel}>
                            Unique identifiers
                          </span>
                          <span className={styles.fieldValue}>
                            {adminIdentifiers}
                          </span>
                        </div>
                        <div className={styles.fieldGroup}>
                          <span className={styles.fieldLabel}>
                            Hidden marks / personal details
                          </span>
                          <span className={styles.fieldValue}>
                            {adminMarks}
                          </span>
                        </div>
                        <div className={styles.fieldGroup}>
                          <span className={styles.fieldLabel}>
                            Extra notes / context
                          </span>
                          <span className={styles.fieldValue}>
                            {adminNotes}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.claimColumn}>
                      <h4 className={styles.claimColumnTitle}>
                        Claim Request Details
                      </h4>
                      <div className={styles.claimImageCard}>
                        {proofImage ? (
                          <img
                            src={proofImage}
                            alt="Claim proof"
                            className={styles.claimImage}
                            onClick={() => setZoomImage(proofImage)}
                          />
                        ) : (
                          <div className={styles.imagePlaceholder}>
                            <HiOutlinePhotograph />
                            <span>No image provided</span>
                          </div>
                        )}
                      </div>

                      <div className={styles.fieldGroup}>
                        <span className={styles.fieldLabel}>
                          Item name / category
                        </span>
                        <span className={styles.fieldValue}>
                          {itemTitle}
                          <span className={styles.fieldMuted}>
                            {` \u2022 ${itemCategory}`}
                          </span>
                        </span>
                      </div>

                      <div className={styles.fieldGroup}>
                        <span className={styles.fieldLabel}>Location</span>
                        <span className={styles.fieldValue}>
                          {itemLocation}
                        </span>
                      </div>

                      <div className={styles.fieldGroup}>
                        <span className={styles.fieldLabel}>Date</span>
                        <span className={styles.fieldValue}>
                          {formatNepaliTime(claimDate)}
                        </span>
                      </div>

                      <div className={styles.claimDetailBlock}>
                        <div className={styles.detailBlockTitle}>
                          Verification Details
                        </div>
                        <div className={styles.fieldGroup}>
                          <span className={styles.fieldLabel}>
                            Unique identifiers

                          </span>
                          <span className={styles.fieldValue}>
                            {claimStatement}
                          </span>
                        </div>
                        <div className={styles.fieldGroup}>
                          <span className={styles.fieldLabel}>Hidden marks / personal details
</span>
                          <span className={styles.fieldValue}>
                            {claimDetailType}
                          </span>
                        </div>
                        <div className={styles.fieldGroup}>
                          <span className={styles.fieldLabel}>
                               Extra notes /context
                          </span>
                          <span className={styles.fieldValue}>
                            {claimContext}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
            <div className={styles.claimModalFooter}>
              <button
                type="button"
                className={`${styles.button} ${styles.buttonDanger} ${styles.claimAction}`}
                onClick={() => {
                  setRejectTarget(claimModal);
                  setRejectNote("");
                  setClaimModal(null);
                }}
                disabled={getDisplayStatus(claimModal) !== "Pending Verification"}
              >
                Reject
              </button>
              <button
                type="button"
                className={`${styles.button} ${styles.buttonSuccess} ${styles.claimAction}`}
                onClick={() => {
                  setVerifyTarget(claimModal);
                  setVerifyNote("");
                  setClaimModal(null);
                }}
                disabled={getDisplayStatus(claimModal) !== "Pending Verification"}
              >
                Verify
              </button>
            </div>
          </div>
        </div>
      )}

      {zoomImage && (
        <div
          className={styles.zoomOverlay}
          onClick={() => setZoomImage(null)}
        >
          <img
            src={zoomImage}
            alt="Proof detail"
            className={styles.zoomImage}
            onClick={(event) => event.stopPropagation()}
          />
          <button
            type="button"
            className={styles.zoomClose}
            onClick={() => setZoomImage(null)}
          >
            <HiX />
          </button>
        </div>
      )}
    </AdminLayout>
  );
}

