const db = require("../models");
const {
  fetchClaimForChat,
  getChatStatus,
  getSenderRole,
  isParticipant,
  ensureThreadForClaim,
} = require("../utils/chatHelpers");
const { getAccountNotice } = require("../utils/userStatus");

const Message = db.Message;

const registerChatSockets = (io) => {
  io.on("connection", (socket) => {
    const emitRoomError = (message) => {
      socket.emit("room_error", { message });
      socket.emit("error", { message });
    };

    const emitMessageError = (message) => {
      socket.emit("message_error", { message });
      socket.emit("error", { message });
    };

    socket.on("join_room", async ({ claimId }) => {
      try {
        const parsedClaimId = Number(claimId);
        if (!parsedClaimId) {
          emitRoomError("Invalid claim id");
          return;
        }

        const claim = await fetchClaimForChat(parsedClaimId);
        if (!claim) {
          emitRoomError("Claim not found");
          return;
        }

        if (!isParticipant(socket.user, claim)) {
          emitRoomError("Not authorized for this claim");
          return;
        }

        const chatStatus = getChatStatus(claim);
        if (chatStatus.isVerified && !claim.thread) {
          await ensureThreadForClaim(claim);
        }

        const roomId = `claim:${parsedClaimId}`;
        socket.join(roomId);
        socket.emit("room_joined", {
          claimId: parsedClaimId,
          claimSummary: {
            id: parsedClaimId,
            status: chatStatus.status,
          },
          status: chatStatus.status,
          ownerConfirmed: chatStatus.ownerConfirmed,
          finderConfirmed: chatStatus.finderConfirmed,
          canSend: chatStatus.canSend,
        });
      } catch (error) {
        console.error("SOCKET JOIN ROOM ERROR:", error);
        emitRoomError("Unable to join room");
      }
    });

    socket.on("send_message", async ({ claimId, text }) => {
      try {
        const accountNotice = getAccountNotice(socket.user);
        if (accountNotice?.status === "suspended") {
          emitMessageError(accountNotice.message);
          return;
        }
        const parsedClaimId = Number(claimId);
        if (!parsedClaimId) {
          emitMessageError("Invalid claim id");
          return;
        }

        const messageText = typeof text === "string" ? text.trim() : "";
        if (!messageText) {
          emitMessageError("Message text required");
          return;
        }

        const claim = await fetchClaimForChat(parsedClaimId);
        if (!claim) {
          emitMessageError("Claim not found");
          return;
        }

        if (!isParticipant(socket.user, claim)) {
          emitMessageError("Not authorized for this claim");
          return;
        }

        const chatStatus = getChatStatus(claim);
        const isAdmin = socket.user.role === "admin";
        if (!isAdmin) {
          if (!chatStatus.isVerified) {
            emitMessageError("Chat is available only after verification");
            return;
          }
          if (chatStatus.isRejected || chatStatus.isResolved) {
            emitMessageError("Chat is disabled for this claim");
            return;
          }
          if (chatStatus.bothConfirmed) {
            emitMessageError("Chat is locked after confirmations");
            return;
          }
        }

        const threadData = await ensureThreadForClaim(claim);
        const senderRole = getSenderRole(socket.user, claim);
        const messageType = isAdmin ? "system" : "user";
        const message = await Message.create({
          thread_id: threadData.thread.id,
          claim_id: claim.id,
          sender_id: socket.user.id,
          sender_role: senderRole,
          type: messageType,
          message_text: messageText,
        });

        const payload = {
          id: message.id,
          claimId: claim.id,
          sender_id: socket.user.id,
          sender_role: senderRole,
          type: messageType,
          text: message.message_text,
          created_at: message.created_at,
        };

        io.to(`claim:${parsedClaimId}`).emit("new_message", payload);
      } catch (error) {
        console.error("SOCKET SEND MESSAGE ERROR:", error);
        emitMessageError("Unable to send message");
      }
    });

    socket.on("confirm_owner_received", async ({ claimId }) => {
      try {
        const parsedClaimId = Number(claimId);
        if (!parsedClaimId) {
          emitMessageError("Invalid claim id");
          return;
        }

        const claim = await fetchClaimForChat(parsedClaimId);
        if (!claim) {
          emitMessageError("Claim not found");
          return;
        }

        if (socket.user.role === "admin") {
          emitMessageError("Admins cannot confirm returns");
          return;
        }

        if (getSenderRole(socket.user, claim) !== "owner") {
          emitMessageError("Not authorized to confirm this claim");
          return;
        }

        const chatStatus = getChatStatus(claim);
        if (!chatStatus.isVerified) {
          emitMessageError("Claim must be verified before confirmation");
          return;
        }
        if (chatStatus.isRejected || chatStatus.isResolved) {
          emitMessageError("This claim is closed");
          return;
        }

        const threadData = await ensureThreadForClaim(claim);
        let confirmation = threadData.confirmation;
        const wasOwnerConfirmed = Boolean(confirmation.owner_confirmed);
        if (!wasOwnerConfirmed) {
          confirmation = await confirmation.update({
            owner_confirmed: true,
          });
        }

        const ownerConfirmed = Boolean(confirmation.owner_confirmed);
        const finderConfirmed = Boolean(confirmation.finder_confirmed);
        const roomId = `claim:${parsedClaimId}`;
        let claimStatus = claim.status;

        if (!wasOwnerConfirmed) {
          const senderRole = getSenderRole(socket.user, claim);
          const message = await Message.create({
            thread_id: threadData.thread.id,
            claim_id: claim.id,
            sender_id: socket.user.id,
            sender_role: senderRole,
            type: "system",
            message_text: "Owner confirmed they received the item.",
          });

          io.to(roomId).emit("new_message", {
            id: message.id,
            claimId: claim.id,
            sender_id: socket.user.id,
            sender_role: senderRole,
            type: message.type,
            text: message.message_text,
            created_at: message.created_at,
          });
        }

        if (
          ownerConfirmed &&
          finderConfirmed &&
          claim.status !== "resolved"
        ) {
          const updatedClaim = await claim.update({
            status: "awaiting_admin_resolution",
          });
          claimStatus = updatedClaim.status;
        }

        io.to(roomId).emit("confirmation_update", {
          claimId: parsedClaimId,
          ownerConfirmed,
          finderConfirmed,
          claimStatus,
        });

        if (ownerConfirmed && finderConfirmed) {
          io.to(roomId).emit("chat_locked", {
            claimId: parsedClaimId,
            message:
              "Both parties confirmed the exchange. Awaiting admin resolution.",
          });
        }
      } catch (error) {
        console.error("SOCKET CONFIRM OWNER ERROR:", error);
        emitMessageError("Unable to confirm receipt");
      }
    });

    socket.on("confirm_finder_returned", async ({ claimId }) => {
      try {
        const parsedClaimId = Number(claimId);
        if (!parsedClaimId) {
          emitMessageError("Invalid claim id");
          return;
        }

        const claim = await fetchClaimForChat(parsedClaimId);
        if (!claim) {
          emitMessageError("Claim not found");
          return;
        }

        if (socket.user.role === "admin") {
          emitMessageError("Admins cannot confirm returns");
          return;
        }

        if (getSenderRole(socket.user, claim) !== "finder") {
          emitMessageError("Not authorized to confirm this claim");
          return;
        }

        const chatStatus = getChatStatus(claim);
        if (!chatStatus.isVerified) {
          emitMessageError("Claim must be verified before confirmation");
          return;
        }
        if (chatStatus.isRejected || chatStatus.isResolved) {
          emitMessageError("This claim is closed");
          return;
        }

        const threadData = await ensureThreadForClaim(claim);
        let confirmation = threadData.confirmation;
        const wasFinderConfirmed = Boolean(confirmation.finder_confirmed);
        if (!wasFinderConfirmed) {
          confirmation = await confirmation.update({
            finder_confirmed: true,
          });
        }

        const ownerConfirmed = Boolean(confirmation.owner_confirmed);
        const finderConfirmed = Boolean(confirmation.finder_confirmed);
        const roomId = `claim:${parsedClaimId}`;
        let claimStatus = claim.status;

        if (!wasFinderConfirmed) {
          const senderRole = getSenderRole(socket.user, claim);
          const message = await Message.create({
            thread_id: threadData.thread.id,
            claim_id: claim.id,
            sender_id: socket.user.id,
            sender_role: senderRole,
            type: "system",
            message_text: "Finder confirmed they returned the item.",
          });

          io.to(roomId).emit("new_message", {
            id: message.id,
            claimId: claim.id,
            sender_id: socket.user.id,
            sender_role: senderRole,
            type: message.type,
            text: message.message_text,
            created_at: message.created_at,
          });
        }

        if (
          ownerConfirmed &&
          finderConfirmed &&
          claim.status !== "resolved"
        ) {
          const updatedClaim = await claim.update({
            status: "awaiting_admin_resolution",
          });
          claimStatus = updatedClaim.status;
        }

        io.to(roomId).emit("confirmation_update", {
          claimId: parsedClaimId,
          ownerConfirmed,
          finderConfirmed,
          claimStatus,
        });

        if (ownerConfirmed && finderConfirmed) {
          io.to(roomId).emit("chat_locked", {
            claimId: parsedClaimId,
            message:
              "Both parties confirmed the exchange. Awaiting admin resolution.",
          });
        }
      } catch (error) {
        console.error("SOCKET CONFIRM FINDER ERROR:", error);
        emitMessageError("Unable to confirm return");
      }
    });

    socket.on("leave_room", ({ claimId }) => {
      const parsedClaimId = Number(claimId);
      if (parsedClaimId) {
        socket.leave(`claim:${parsedClaimId}`);
      }
    });
  });
};

module.exports = registerChatSockets;
