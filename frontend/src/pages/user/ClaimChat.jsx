import { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import {
  HiOutlineChatAlt2,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineExclamationCircle,
  HiOutlineLocationMarker,
  HiOutlineLockClosed,
  HiOutlinePaperAirplane,
  HiOutlinePhotograph,
  HiOutlineShieldCheck,
} from "react-icons/hi";
import Header from "../../components/layout/Header";
import api from "../../services/api";
import { getUser } from "../../utils/auth/authToken";
import styles from "./ClaimChat.module.css";

const getSocketUrl = () => {
  const apiBase = api.defaults.baseURL || "http://localhost:5000/api";
  return apiBase.replace(/\/api\/?$/, "");
};

const normalizeStatus = (status) => {
  const normalized = String(status || "").toLowerCase();
  if (normalized.includes("rejected")) return "rejected";
  if (normalized.includes("resolved") || normalized.includes("closed")) {
    return "resolved";
  }
  if (normalized.includes("awaiting")) return "awaiting_resolution";
  if (normalized.includes("verified") || normalized.includes("approved")) {
    return "verified";
  }
  return "pending";
};

const getStatusLabel = (status) => {
  if (status === "verified") return "Verified";
  if (status === "awaiting_resolution") return "Awaiting Resolution";
  if (status === "resolved") return "Resolved";
  if (status === "rejected") return "Rejected";
  return "Pending";
};

const getBannerConfig = (status, bothConfirmed) => {
  if (status === "rejected") {
    return {
      tone: "rejected",
      icon: <HiOutlineLockClosed />,
      title: "Claim Rejected",
      text: "Messaging is read-only because the claim was rejected.",
    };
  }
  if (status === "resolved") {
    return {
      tone: "resolved",
      icon: <HiOutlineLockClosed />,
      title: "Claim Resolved",
      text: "This claim is resolved. Messaging is locked.",
    };
  }
  if (status === "awaiting_resolution" || bothConfirmed) {
    return {
      tone: "awaiting",
      icon: <HiOutlineExclamationCircle />,
      title: "Awaiting Admin Resolution",
      text: "Exchange confirmed by both users. Messaging is locked.",
    };
  }
  if (status === "verified") {
    return {
      tone: "verified",
      icon: <HiOutlineCheckCircle />,
      title: "Claim Verified",
      text: "Chat is open for the owner and finder to coordinate.",
    };
  }
  return {
    tone: "pending",
    icon: <HiOutlineClock />,
    title: "Pending Verification",
    text: "Chat is available only after admin verification.",
  };
};

const getRoleLabel = (role) => {
  if (role === "admin") return "Admin";
  if (role === "lost_owner" || role === "owner") return "Owner";
  if (role === "found_owner" || role === "finder") return "Finder";
  return "User";
};

const normalizeSenderRole = (role) => {
  if (role === "lost_owner" || role === "owner") return "owner";
  if (role === "found_owner" || role === "finder") return "finder";
  if (role === "admin") return "admin";
  return "user";
};

const formatTimestamp = (value) => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString("en-NP", {
    timeZone: "Asia/Kathmandu",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatListTimestamp = (value) => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleTimeString("en-NP", {
    timeZone: "Asia/Kathmandu",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function ClaimChat() {
  const socketRef = useRef(null);
  const threadRef = useRef(null);
  const selectedClaimIdRef = useRef(null);

  const currentUser = useMemo(() => getUser(), []);
  const [claims, setClaims] = useState([]);
  const [selectedClaimId, setSelectedClaimId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [roomState, setRoomState] = useState({
    status: "pending",
    ownerConfirmed: false,
    finderConfirmed: false,
    canSend: false,
  });
  const [accountStatus, setAccountStatus] = useState("active");
  const [accountNotice, setAccountNotice] = useState("");
  const [pendingOwnerConfirm, setPendingOwnerConfirm] = useState(false);
  const [pendingFinderConfirm, setPendingFinderConfirm] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const selectedClaim = useMemo(
    () => claims.find((claim) => claim.id === selectedClaimId) || null,
    [claims, selectedClaimId]
  );

  useEffect(() => {
    let isMounted = true;

    const fetchClaims = async () => {
      setLoading(true);
      setErrorMessage("");
      try {
        const response = await api.get("/claims/with-messages");
        const rawData = response.data;
        const accountData = Array.isArray(rawData)
          ? null
          : rawData?.account || null;
        const data = Array.isArray(rawData)
          ? rawData
          : rawData?.claims || [];
        const mapped = data.map((claim) => {
          const status = normalizeStatus(claim.status);
          return {
            id: claim.id,
            status,
            statusLabel: getStatusLabel(status),
            ownerConfirmed: Boolean(claim.ownerConfirmed),
            finderConfirmed: Boolean(claim.finderConfirmed),
            canSend: Boolean(claim.canSend),
            role: claim.role || "viewer",
            item: {
              name: claim.item?.name || "Unknown item",
              location: claim.item?.location || "Unknown location",
              imageUrl: claim.item?.imageUrl || null,
            },
            ownerName: claim.ownerName || "Owner",
            finderName: claim.finderName || "Finder",
            otherPartyName: claim.otherPartyName || "User",
            lastMessage: claim.lastMessage || null,
            lastMessageAt: claim.lastMessageAt || null,
          };
        });

        if (isMounted) {
          setAccountStatus(
            accountData?.status || currentUser?.status || "active"
          );
          setAccountNotice(accountData?.notice || "");
          setClaims(mapped);
          setUnreadCounts((prev) => {
            const next = {};
            mapped.forEach((claim) => {
              next[claim.id] = prev[claim.id] || 0;
            });
            return next;
          });
          if (mapped.length && !selectedClaimId) {
            setSelectedClaimId(mapped[0].id);
          }
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
    if (!errorMessage) return;
    const timeoutId = setTimeout(() => {
      setErrorMessage("");
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [errorMessage]);

  useEffect(() => {
    selectedClaimIdRef.current = selectedClaimId;
  }, [selectedClaimId]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || socketRef.current) return;

    const socket = io(getSocketUrl(), { auth: { token } });

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
      if (!payload?.claimId) return;
      const activeClaimId = selectedClaimIdRef.current;
      const isActive = payload.claimId === activeClaimId;
      const isFromSelf =
        currentUser?.id && payload.sender_id === currentUser.id;

      if (isActive) {
        setMessages((prev) => [
          ...prev,
          {
            id: payload.id,
            sender_id: payload.sender_id,
            sender_role: payload.sender_role,
            type: payload.type || (payload.sender_role === "admin" ? "system" : "user"),
            text: payload.text,
            created_at: payload.created_at,
          },
        ]);
      }
      setClaims((prev) =>
        prev.map((claim) =>
          claim.id === payload.claimId
            ? {
                ...claim,
                lastMessage: payload.text,
                lastMessageAt: payload.created_at,
              }
            : claim
        )
      );
      if (!isActive && !isFromSelf) {
        setUnreadCounts((prev) => ({
          ...prev,
          [payload.claimId]: (prev[payload.claimId] || 0) + 1,
        }));
      }
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
      setClaims((prev) =>
        prev.map((claim) =>
          claim.id === payload.claimId
            ? {
                ...claim,
                ownerConfirmed: Boolean(payload.ownerConfirmed),
                finderConfirmed: Boolean(payload.finderConfirmed),
                status: payload?.claimStatus
                  ? normalizeStatus(payload.claimStatus)
                  : claim.status,
                statusLabel: payload?.claimStatus
                  ? getStatusLabel(
                      normalizeStatus(payload.claimStatus)
                    )
                  : claim.statusLabel,
              }
            : claim
        )
      );
      setPendingOwnerConfirm(false);
      setPendingFinderConfirm(false);
    });

    socket.on("chat_locked", (payload) => {
      if (payload?.claimId !== selectedClaimIdRef.current) return;
      setRoomState((prev) => ({
        ...prev,
        canSend: false,
      }));
    });

    socket.on("room_error", (payload) => {
      setErrorMessage(payload?.message || "Unable to join chat.");
    });

    socket.on("message_error", (payload) => {
      setErrorMessage(payload?.message || "Unable to send message.");
      setPendingOwnerConfirm(false);
      setPendingFinderConfirm(false);
    });

    socket.on("error", (payload) => {
      if (payload?.message) {
        setErrorMessage(payload.message);
      }
    });

    socket.on("connect_error", () => {
      setErrorMessage("Unable to connect to chat server.");
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!selectedClaim) return;
    const status = normalizeStatus(selectedClaim.status);
    const bothConfirmed =
      Boolean(selectedClaim.ownerConfirmed) &&
      Boolean(selectedClaim.finderConfirmed);
    setRoomState({
      status,
      ownerConfirmed: Boolean(selectedClaim.ownerConfirmed),
      finderConfirmed: Boolean(selectedClaim.finderConfirmed),
      canSend: status === "verified" && !bothConfirmed,
    });
  }, [selectedClaim]);

  useEffect(() => {
    if (!selectedClaimId) return;
    setPendingOwnerConfirm(false);
    setPendingFinderConfirm(false);
    setUnreadCounts((prev) =>
      prev[selectedClaimId] ? { ...prev, [selectedClaimId]: 0 } : prev
    );

    const fetchMessages = async () => {
      try {
        const response = await api.get(
          `/claims/${selectedClaimId}/messages`
        );
        const data = Array.isArray(response.data) ? response.data : [];
        setMessages(
          data.map((message) => ({
            id: message.id,
            sender_id: message.sender_id,
            sender_role: message.sender_role,
            type:
              message.type ||
              (message.sender_role === "admin" ? "system" : "user"),
            text: message.text,
            created_at: message.created_at,
          }))
        );
      } catch (error) {
        setMessages([]);
        setErrorMessage("Unable to load messages.");
      }
    };

    fetchMessages();
    socketRef.current?.emit("join_room", {
      claimId: selectedClaimId,
    });
  }, [selectedClaimId]);

  useEffect(() => {
    if (!threadRef.current) return;
    threadRef.current.scrollTop = threadRef.current.scrollHeight;
  }, [messages]);

  const accountRestricted =
    accountStatus === "suspended" || accountStatus === "blocked";

  const accountNoticeMessage = useMemo(() => {
    if (!accountRestricted || !accountNotice) return null;
    return {
      id: "account-notice",
      sender_id: null,
      sender_role: "admin",
      type: "system",
      text: accountNotice,
      created_at: new Date().toISOString(),
    };
  }, [accountNotice, accountRestricted]);

  const visibleMessages = useMemo(() => {
    if (!accountNoticeMessage) return messages;
    const hasNotice = messages.some(
      (message) =>
        message.type === "system" &&
        message.text === accountNoticeMessage.text
    );
    return hasNotice
      ? messages
      : [accountNoticeMessage, ...messages];
  }, [accountNoticeMessage, messages]);

  const bothConfirmed =
    roomState.ownerConfirmed && roomState.finderConfirmed;
  const banner = getBannerConfig(roomState.status, bothConfirmed);
  const canSend =
    roomState.canSend &&
    draft.trim().length > 0 &&
    !accountRestricted;
  const showConfirm =
    roomState.status === "verified" && !bothConfirmed;
  const isOwner = selectedClaim?.role === "owner";
  const isFinder = selectedClaim?.role === "finder";
  const requiresConfirmForDelete = roomState.status === "verified";
  const hasDeleteConfirmation = isOwner
    ? roomState.ownerConfirmed
    : isFinder
      ? roomState.finderConfirmed
      : false;
  const canDeleteChat =
    selectedClaim && (!requiresConfirmForDelete || hasDeleteConfirmation);
  const confirmationDisabled =
    roomState.status !== "verified" ||
    bothConfirmed ||
    pendingOwnerConfirm ||
    pendingFinderConfirm;
  const lockedPlaceholder = accountRestricted
    ? accountNotice || "Your account is restricted. Messaging is disabled."
    : roomState.canSend
      ? "Type your message..."
      : roomState.status === "awaiting_resolution" || bothConfirmed
        ? "Chat locked. This conversation is read-only because the claim is awaiting admin resolution."
        : roomState.status === "rejected"
          ? "Chat locked. This conversation is read-only because the claim was rejected."
          : roomState.status === "resolved"
            ? "Chat locked. This conversation is read-only because the claim is resolved."
            : roomState.status === "pending"
              ? "Chat is available after admin verification."
              : "Chat locked. This conversation is read-only.";

  const handleSend = () => {
    if (!selectedClaimId || !draft.trim()) return;
    if (!roomState.canSend || accountRestricted) return;
    socketRef.current?.emit("send_message", {
      claimId: selectedClaimId,
      text: draft.trim(),
    });
    setDraft("");
  };

  const handleOwnerConfirm = async () => {
    if (!selectedClaimId || confirmationDisabled) return;
    setPendingOwnerConfirm(true);
    if (socketRef.current?.connected) {
      socketRef.current.emit("confirm_owner_received", {
        claimId: selectedClaimId,
      });
      return;
    }
    try {
      const response = await api.patch(
        `/claims/${selectedClaimId}/confirm-owner`
      );
      setRoomState((prev) => ({
        ...prev,
        status: response.data?.claimStatus
          ? normalizeStatus(response.data.claimStatus)
          : prev.status,
        ownerConfirmed: Boolean(response.data.ownerConfirmed),
        finderConfirmed: Boolean(response.data.finderConfirmed),
        canSend:
          (response.data?.claimStatus
            ? normalizeStatus(response.data.claimStatus)
            : prev.status) === "verified" &&
          !Boolean(response.data.bothConfirmed),
      }));
    } catch (error) {
      setErrorMessage("Unable to confirm receipt.");
    } finally {
      setPendingOwnerConfirm(false);
    }
  };

  const handleFinderConfirm = async () => {
    if (!selectedClaimId || confirmationDisabled) return;
    setPendingFinderConfirm(true);
    if (socketRef.current?.connected) {
      socketRef.current.emit("confirm_finder_returned", {
        claimId: selectedClaimId,
      });
      return;
    }
    try {
      const response = await api.patch(
        `/claims/${selectedClaimId}/confirm-finder`
      );
      setRoomState((prev) => ({
        ...prev,
        status: response.data?.claimStatus
          ? normalizeStatus(response.data.claimStatus)
          : prev.status,
        ownerConfirmed: Boolean(response.data.ownerConfirmed),
        finderConfirmed: Boolean(response.data.finderConfirmed),
        canSend:
          (response.data?.claimStatus
            ? normalizeStatus(response.data.claimStatus)
            : prev.status) === "verified" &&
          !Boolean(response.data.bothConfirmed),
      }));
    } catch (error) {
      setErrorMessage("Unable to confirm return.");
    } finally {
      setPendingFinderConfirm(false);
    }
  };

  const handleDeleteChat = async () => {
    if (!selectedClaimId || !canDeleteChat) return;
    setErrorMessage("");
    try {
      await api.delete(`/claims/${selectedClaimId}/thread`);
      setMessages([]);
      setClaims((prev) => {
        const nextClaims = prev.filter(
          (claim) => claim.id !== selectedClaimId
        );
        setSelectedClaimId(nextClaims[0]?.id || null);
        setUnreadCounts((counts) => {
          const nextCounts = { ...counts };
          delete nextCounts[selectedClaimId];
          return nextCounts;
        });
        return nextClaims;
      });
      setIsDeleteModalOpen(false);
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || "Unable to delete this chat."
      );
    }
  };

  return (
    <>
      <Header />

      <div className={styles.pageWrapper}>
        {errorMessage && (
          <div className={styles.errorBanner}>{errorMessage}</div>
        )}

        <main className={styles.mainContent}>
          <aside className={styles.conversationsSidebar}>
            <div className={styles.sidebarHeader}>
              <h1 className={styles.sidebarTitle}>Messages</h1>
              <p className={styles.sidebarSubtitle}>
                Chats for verified claims only
              </p>
            </div>
            <div className={styles.conversationsList}>
              {loading ? (
                <div className={styles.emptyState}>
                  Loading conversations...
                </div>
              ) : claims.length === 0 ? (
                <div className={styles.emptyState}>
                  No conversations yet.
                </div>
              ) : (
                claims.map((claim) => {
                  const unreadCount = unreadCounts[claim.id] || 0;
                  return (
                    <button
                      type="button"
                      key={claim.id}
                      className={`${styles.conversationCard} ${
                        claim.id === selectedClaimId
                          ? styles.active
                          : ""
                      } ${
                        unreadCount > 0 ? styles.unread : ""
                      }`}
                      onClick={() => setSelectedClaimId(claim.id)}
                    >
                      <div className={styles.itemThumbnail}>
                        {claim.item.imageUrl ? (
                          <img
                            src={claim.item.imageUrl}
                            alt={claim.item.name}
                          />
                        ) : (
                          <HiOutlinePhotograph />
                        )}
                      </div>
                      <div className={styles.conversationInfo}>
                        <div className={styles.conversationHeader}>
                          <div className={styles.itemName}>
                            {claim.item.name}
                          </div>
                          <div className={styles.badgeGroup}>
                            <span
                              className={`${styles.statusBadge} ${
                                styles[
                                  `status${claim.statusLabel.replace(
                                    /\s/g,
                                    ""
                                  )}`
                                ]
                              }`}
                            >
                              {claim.statusLabel}
                            </span>
                            {unreadCount > 0 && (
                              <span className={styles.unreadBadge}>
                                {unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className={styles.lastMessage}>
                          {claim.lastMessage || "No messages yet"}
                        </div>
                        <div className={styles.messageTime}>
                          {formatListTimestamp(claim.lastMessageAt)}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          <section className={styles.chatPanel}>
            {!selectedClaim ? (
              accountNoticeMessage ? (
                <div className={styles.messagesArea}>
    <div className={styles.systemMessage}>
      <div
        className={`${styles.systemBubble} ${styles.adminNotice}`}
      >
        <div className={styles.systemHeader}>
          <HiOutlineExclamationCircle />
          <span>ADMIN NOTICE</span>
        </div>
        <div className={styles.systemText}>
          {accountNoticeMessage.text}
        </div>
        <div className={styles.systemTimestamp}>
          {formatTimestamp(accountNoticeMessage.created_at)}
        </div>
      </div>
    </div>
                </div>
              ) : (
                <div className={styles.emptyState}>
                  Select a conversation to view messages
                </div>
              )
            ) : (
              <>
                <div className={styles.chatHeader}>
                  <div className={styles.chatItemImage}>
                    {selectedClaim.item.imageUrl ? (
                      <img
                        src={selectedClaim.item.imageUrl}
                        alt={selectedClaim.item.name}
                      />
                    ) : (
                      <HiOutlineChatAlt2 />
                    )}
                  </div>
                  <div className={styles.chatItemInfo}>
                    <div className={styles.chatItemName}>
                      {selectedClaim.item.name}
                    </div>
                    <div className={styles.chatItemLocation}>
                      <HiOutlineLocationMarker />
                      <span>{selectedClaim.item.location}</span>
                    </div>
                    <div className={styles.chatItemMeta}>
                      Chat with {selectedClaim.otherPartyName}
                    </div>
                  </div>
                  <div className={styles.chatHeaderActions}>
                    <span
                      className={`${styles.statusBadge} ${
                        styles[
                          `status${selectedClaim.statusLabel.replace(
                            /\s/g,
                            ""
                          )}`
                        ]
                      }`}
                    >
                      {selectedClaim.statusLabel}
                    </span>
                    {canDeleteChat && (
                      <button
                        type="button"
                        className={styles.deleteChatButton}
                        onClick={() => setIsDeleteModalOpen(true)}
                      >
                        Delete Chat
                      </button>
                    )}
                  </div>
                </div>

                {/* Primary status banner */}
                <div className={`${styles.banner} ${styles[banner.tone]}`}>
                  <div className={styles.bannerIcon}>{banner.icon}</div>
                  <div className={styles.bannerContent}>
                    <div className={styles.bannerTitle}>
                      {banner.title}
                    </div>
                    <div className={styles.bannerText}>
                      {banner.text}
                    </div>
                  </div>
                </div>

                <div className={styles.messagesArea} ref={threadRef}>
                  {visibleMessages.length === 0 ? (
                    <div className={styles.emptyState}>
                      No messages yet.
                    </div>
                  ) : (
                    visibleMessages.map((message) => {
                      const normalizedRole = normalizeSenderRole(
                        message.sender_role
                      );
                      const isSystem =
                        message.type === "system" ||
                        normalizedRole === "admin";
                      const alignmentClass =
                        normalizedRole === "finder"
                          ? styles.sent
                          : styles.received;

                      if (isSystem) {
                        return (
                          <div
                            key={message.id}
                            className={styles.systemMessage}
                          >
                            <div
                              className={`${styles.systemBubble} ${styles.adminNotice}`}
                            >
                              {/* Admin/system notices are full-width banners */}
                              <div className={styles.systemHeader}>
                                <HiOutlineExclamationCircle />
                                <span>ADMIN NOTICE</span>
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
                          className={`${styles.message} ${alignmentClass}`}
                        >
                          <div className={styles.messageBubble}>
                            <div className={styles.messageRole}>
                              {getRoleLabel(message.sender_role)}
                            </div>
                            <div className={styles.messageText}>
                              {message.text}
                            </div>
                            <div className={styles.messageTimestamp}>
                              {formatTimestamp(message.created_at)}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {showConfirm && (
                  <div className={styles.confirmationSection}>
                    <div className={styles.confirmationTitle}>
                      Confirm item exchange
                    </div>
                    <div className={styles.confirmationButtons}>
                      {isOwner && (
                        <button
                          type="button"
                          className={`${styles.confirmButton} ${styles.owner}`}
                          onClick={handleOwnerConfirm}
                          disabled={
                            roomState.ownerConfirmed ||
                            confirmationDisabled
                          }
                        >
                          {roomState.ownerConfirmed
                            ? "Received"
                            : "I Received My Item"}
                        </button>
                      )}
                      {isFinder && (
                        <button
                          type="button"
                          className={`${styles.confirmButton} ${styles.finder}`}
                          onClick={handleFinderConfirm}
                          disabled={
                            roomState.finderConfirmed ||
                            confirmationDisabled
                          }
                        >
                          {roomState.finderConfirmed
                            ? "Returned"
                            : "I Returned This Item"}
                        </button>
                      )}
                      {!isOwner && !isFinder && (
                        <div className={styles.confirmationNotice}>
                          Admins cannot confirm returns.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Single confirmation block per state to reduce noise */}

                <div className={styles.inputArea}>
                  <div className={styles.safetyNotice}>
                    <HiOutlineLockClosed />
                    <span>
                      Keep personal details private. Coordinate safely
                      within this chat.
                    </span>
                  </div>
                  <div className={styles.inputContainer}>
                    <textarea
                      className={styles.messageInput}
                      rows={1}
                      placeholder={lockedPlaceholder}
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      disabled={!roomState.canSend || accountRestricted}
                    />
                    <button
                      type="button"
                      className={styles.sendButton}
                      onClick={handleSend}
                      disabled={!canSend}
                    >
                      <HiOutlinePaperAirplane />
                      Send
                    </button>
                  </div>
                </div>
              </>
            )}
          </section>
        </main>
      </div>

      {isDeleteModalOpen && (
        <div
          className={styles.modalOverlay}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setIsDeleteModalOpen(false);
            }
          }}
        >
          <div className={styles.modalCard}>
            <div className={styles.modalTitle}>Delete chat?</div>
            <div className={styles.modalText}>
              This will permanently delete the chat and all messages for
              this claim. This action cannot be undone.
            </div>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.modalCancel}
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.modalDelete}
                onClick={handleDeleteChat}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
}
