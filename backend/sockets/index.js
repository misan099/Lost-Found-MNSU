const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");
const db = require("../models");
const registerChatSockets = require("./chat.socket");
const { getAccountNotice, resolveUserStatus } = require("../utils/userStatus");

const User = db.User;

const initSockets = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.use(async (socket, next) => {
    try {
      const authHeader = socket.handshake.headers?.authorization || "";
      const bearerToken = authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null;
      const token = socket.handshake.auth?.token || bearerToken;
      if (!token) {
        return next(new Error("Not authorized"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (!decoded?.id) {
        return next(new Error("Invalid token"));
      }

      const user = await User.findByPk(decoded.id, {
        attributes: [
          "id",
          "role",
          "name",
          "status",
          "suspended_until",
          "suspension_note",
          "blocked_note",
        ],
      });
      if (!user) {
        return next(new Error("User not found"));
      }

      await resolveUserStatus(user);
      const accountNotice = getAccountNotice(user);
      if (accountNotice?.status === "blocked") {
        return next(new Error(accountNotice.message));
      }

      socket.user = {
        id: user.id,
        role: user.role,
        name: user.name,
        status: user.status,
        suspended_until: user.suspended_until,
        suspension_note: user.suspension_note,
        blocked_note: user.blocked_note,
      };
      return next();
    } catch (error) {
      return next(new Error("Not authorized"));
    }
  });

  registerChatSockets(io);

  return io;
};

module.exports = initSockets;
