import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import {
  HiOutlineChatAlt2,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineExclamationCircle,
  HiOutlineInformationCircle,
} from "react-icons/hi";
import AdminLayout from "../../components/admin/AdminLayout";
import api from "../../services/api";
import styles from "./AdminMessages.module.css";

const getSocketUrl = () => {
  const apiBase = api.defaults.baseURL || "http://localhost:5000/api";
  return apiBase.replace(/\/api\/?$/, "");
};

const formatTimestamp = (dateString) => {
  if (!dateString) return "";
  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) return dateString;
  return parsed.toLocaleString("en-NP", {
    timeZone: "Asia/Kathmandu",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const normalizeStatus = (status) => {
  const normalized = String(status || "").toLowerCase();
  if (normalized.includes("rejected")) return "rejected";
  if (normalized.includes("resolved")) return "resolved";
  if (normalized.includes("awaiting")) return "awaiting_resolution";
  if (normalized.includes("verified")) return "verified";
  if (normalized.includes("pending")) return "pending";
  return "pending";
};

const getStatusLabel = (status) => {
  if (status === "verified") return "Verified";
  if (status === "awaiting_resolution") return "Awaiting Resolution";
  if (status === "resolved") return "Resolved";
  if (status === "rejected") return "Rejected";
  return "Pending Verification";
};

const getBannerConfig = (status, bothConfirmed) => {
  if (status === "awaiting_resolution" || bothConfirmed) {
    return {
      tone: "locked",
      icon: <HiOutlineExclamationCircle />,
      text: "Return confirmed by both parties. Awaiting admin resolution. Chat locked.",
    };
  }
  if (status === "verified" && !bothConfirmed) {
    return {
      tone: "verified",
      icon: <HiOutlineCheckCircle />,
      text: "Claim Verified: coordinate return between both parties.",
    };
  }
  if (status === "resolved") {
    return {
      tone: "disabled",
      icon: <HiOutlineInformationCircle />,
      text: "This claim is resolved. Chat is read-only.",
    };
  }
  if (status === "rejected") {
    return {
      tone: "disabled",
      icon: <HiOutlineInformationCircle />,
      text: "This claim was rejected. Chat is read-only.",
    };
  }
  return {
    tone: "pending",
    icon: <HiOutlineClock />,
    text: "Chat is available only after verification.",
  };
};

const getSenderLabel = (role) => {
  if (role === "admin") return "Admin";
  if (role === "owner" || role === "lost_owner") return "Lost Owner";
  if (role === "finder" || role === "found_owner") return "Found Owner";
  return "User";
};

export default function AdminMessages() {
  const navigate = useNavigate();
  const location = useLocation();
  const socketRef = useRef(null);
  const threadRef = useRef(null);
  const selectedClaimIdRef = useRef(null);

  const [claims, setClaims] = useState([]);
  const [selectedClaimId, setSelectedClaimId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [roomState, setRoomState] = useState({
    status: "pending",
    ownerConfirmed: false,
    finderConfirmed: false,
    canSend: false,
  });

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
        const response = await api.get("/admin/claims/with-messages", {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        });

        const data = Array.isArray(response.data) ? response.data : [];
        const mapped = data.map((claim) => {
          const status = normalizeStatus(claim.status);
          return {
            id: claim.id,
            status,
            statusLabel: getStatusLabel(status),
            lostItem: claim.lostItem?.name || "Unknown",
            foundItem: claim.foundItem?.name || "Unknown",
            lostOwner: claim.lostOwner?.name || "Unknown",
            foundOwner: claim.finder?.name || "Unknown",
            ownerConfirmed: Boolean(claim.ownerConfirmed),
            finderConfirmed: Boolean(claim.finderConfirmed),
          };
        });

        if (isMounted) {
          setClaims(mapped);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage("Unable to load conversations.");
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

  useEffect(() => {
    selectedClaimIdRef.current = selectedClaimId;
  }, [selectedClaimId]);

  useEffect(() => {
    const token =
      localStorage.getItem("adminToken") ||
      localStorage.getItem("token");
    if (!token || socketRef.current) return;

    const socket = io(getSocketUrl(), {
      auth: { token },
    });

    socket.on("room_joined", (payload) => {
      if (payload?.claimId !== selectedClaimIdRef.current) return;
      setRoomState({
        status: normalizeStatus(payload.status || "pending"),
        ownerConfirmed: Boolean(payload.ownerConfirmed),
        finderConfirmed: Boolean(payload.finderConfirmed),
        canSend: Boolean(payload.canSend),
      });
    });

    socket.on("new_message", (payload) => {
      if (payload?.claimId !== selectedClaimIdRef.current) return;
      setMessages((prev) => [
        ...prev,
        {
          id: payload.id,
          sender_role: payload.sender_role,
          type: payload.type || (payload.sender_role === "admin" ? "system" : "user"),
          text: payload.text,
          created_at: payload.created_at,
        },
      ]);
    });

    socket.on("confirmation_update", (payload) => {
      if (payload?.claimId !== selectedClaimIdRef.current) return;
      setRoomState((prev) => {
        const bothConfirmed =
          Boolean(payload.ownerConfirmed) &&
          Boolean(payload.finderConfirmed);
        const nextStatus = payload?.claimStatus
          ? normalizeStatus(payload.claimStatus)
          : prev.status;
        return {
          ...prev,
          status: nextStatus,
          ownerConfirmed: Boolean(payload.ownerConfirmed),
          finderConfirmed: Boolean(payload.finderConfirmed),
          canSend: nextStatus === "verified" && !bothConfirmed,
        };
      });
      if (payload?.claimStatus) {
        setClaims((prev) =>
          prev.map((claim) =>
            claim.id === payload.claimId
              ? {
                  ...claim,
                  status: normalizeStatus(payload.claimStatus),
                  statusLabel: getStatusLabel(
                    normalizeStatus(payload.claimStatus)
                  ),
                  ownerConfirmed: Boolean(payload.ownerConfirmed),
                  finderConfirmed: Boolean(payload.finderConfirmed),
                }
              : claim
          )
        );
      }
    });

    socket.on("room_error", (payload) => {
      setErrorMessage(payload?.message || "Unable to join room.");
    });

    socket.on("message_error", (payload) => {
      setErrorMessage(payload?.message || "Unable to send message.");
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!selectedClaimId) return;

    const selectedClaim = claims.find((claim) => claim.id === selectedClaimId);
    const status = selectedClaim?.status || "pending";
    const bothConfirmed =
      Boolean(selectedClaim?.ownerConfirmed) &&
      Boolean(selectedClaim?.finderConfirmed);

    setRoomState({
      status,
      ownerConfirmed: Boolean(selectedClaim?.ownerConfirmed),
      finderConfirmed: Boolean(selectedClaim?.finderConfirmed),
      canSend: status === "verified" && !bothConfirmed,
    });

    const fetchMessages = async () => {
      try {
        const adminToken = localStorage.getItem("adminToken");
        const response = await api.get(`/claims/${selectedClaimId}/messages`, {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        });
        const data = Array.isArray(response.data) ? response.data : [];
        setMessages(
          data.map((message) => ({
            ...message,
            type:
              message.type ||
              (message.sender_role === "admin" ? "system" : "user"),
          }))
        );
      } catch (error) {
        setMessages([]);
        setErrorMessage("Unable to load messages.");
      }
    };

    fetchMessages();
    socketRef.current?.emit("join_room", { claimId: selectedClaimId });
  }, [selectedClaimId, claims]);

  useEffect(() => {
    if (!threadRef.current) return;
    threadRef.current.scrollTop = threadRef.current.scrollHeight;
  }, [messages]);

  const selectedClaim = useMemo(
    () => claims.find((claim) => claim.id === selectedClaimId) || null,
    [claims, selectedClaimId]
  );

  const bothConfirmed =
    roomState.ownerConfirmed && roomState.finderConfirmed;
  const banner = getBannerConfig(roomState.status, bothConfirmed);
  const canSend = Boolean(selectedClaim) && draft.trim().length > 0;

  const handleSend = () => {
    if (!selectedClaimId || !draft.trim()) return;
    socketRef.current?.emit("send_message", {
      claimId: selectedClaimId,
      text: draft.trim(),
    });
    setDraft("");
  };

  return (
    <AdminLayout
      currentPath={location.pathname}
      onNavigate={navigate}
      onLogout={handleLogout}
    >
      <div className={styles.pageWrapper}>
        <header className={styles.pageHeader}>
          <h1>Messages</h1>
        </header>

        {errorMessage && (
          <div className={styles.errorBanner}>{errorMessage}</div>
        )}

        <div className={styles.contentArea}>
          <aside className={styles.conversationsSidebar}>
            <div className={styles.sidebarHeader}>
              <h3 className={styles.sidebarTitle}>Conversations</h3>
            </div>
            <div className={styles.conversationsList}>
              {loading ? (
                <div className={styles.emptyState}>Loading conversations...</div>
              ) : claims.length === 0 ? (
                <div className={styles.emptyState}>No conversations yet.</div>
              ) : (
                claims.map((claim) => (
                  <button
                    type="button"
                    key={claim.id}
                    className={`${styles.conversationCard} ${
                      claim.id === selectedClaimId ? styles.active : ""
                    }`}
                    onClick={() => setSelectedClaimId(claim.id)}
                  >
                    <div className={styles.cardHeader}>
                      <span className={styles.claimIdBadge}>#{claim.id}</span>
                      <span
                        className={`${styles.statusBadge} ${
                          styles[`status${claim.statusLabel.replace(/\s/g, "")}`]
                        }`}
                      >
                        {claim.statusLabel}
                      </span>
                    </div>
                    <div className={styles.cardItems}>
                      <div className={styles.itemRow}>
                        <span className={styles.itemLabel}>Lost:</span> {claim.lostItem}
                      </div>
                      <div className={styles.itemRow}>
                        <span className={styles.itemLabel}>Found:</span> {claim.foundItem}
                      </div>
                    </div>
                    <div className={styles.cardParticipants}>
                      Participants: {claim.lostOwner}, {claim.foundOwner}
                    </div>
                  </button>
                ))
              )}
            </div>
          </aside>

          <main className={styles.messagePanel}>
            {!selectedClaim ? (
              <div className={styles.emptyState}>
                Select a conversation to view messages
              </div>
            ) : (
              <>
                <div className={styles.messageHeader}>
                  <h2>
                    <HiOutlineChatAlt2 /> Claim #{selectedClaim.id}
                  </h2>
                  <div className={styles.headerInfo}>
                    {selectedClaim.lostItem} -> {selectedClaim.foundItem}
                    <br />
                    Participants: {selectedClaim.lostOwner}, {selectedClaim.foundOwner}, Admin
                  </div>
                </div>

                <div className={`${styles.banner} ${styles[banner.tone]}`}>
                  {banner.icon}
                  <span>{banner.text}</span>
                </div>

                <div className={styles.messagesThread} ref={threadRef}>
                  {messages.length === 0 ? (
                    <div className={styles.emptyState}>No messages yet.</div>
                  ) : (
                    messages.map((message) => {
                      const isSystem =
                        message.type === "system" ||
                        message.sender_role === "admin";
                      const isAdmin = message.sender_role === "admin";

                      if (isSystem) {
                        return (
                          <div
                            key={message.id}
                            className={styles.systemMessage}
                          >
                            <div className={styles.systemBubble}>
                              <div className={styles.systemLabel}>
                                Admin Notice
                              </div>
                              <div className={styles.systemText}>
                                {message.text}
                              </div>
                              <div className={styles.systemTimestamp}>
                                {formatTimestamp(message.created_at)}
                              </div>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={message.id}
                          className={`${styles.messageItem} ${
                            isAdmin ? styles.admin : ""
                          }`}
                        >
                          <div className={styles.messageBubble}>
                            <div className={styles.messageSender}>
                              {getSenderLabel(message.sender_role)}
                            </div>
                            <div className={styles.messageText}>{message.text}</div>
                            <div className={styles.messageTimestamp}>
                              {formatTimestamp(message.created_at)}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className={styles.inputSection}>
                  <div className={styles.messageCompose}>
                    <textarea
                      rows={3}
                      placeholder={
                        selectedClaim
                          ? "Write admin notice..."
                          : "Select a claim to post a notice"
                      }
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      disabled={!selectedClaim}
                    />
                    <button
                      type="button"
                      className={styles.sendButton}
                      onClick={handleSend}
                      disabled={!canSend}
                    >
                      Send Notice
                    </button>
                  </div>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </AdminLayout>
  );
}
