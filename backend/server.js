const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http");
require("dotenv").config();

const sequelize = require("./database/sequelize");
const initSockets = require("./sockets");
// load models
require("./models");

const authRoutes = require("./routes/authRoutes");
const lostItemsRoutes = require("./routes/lostItems.routes");
const foundItemsRoutes = require("./routes/foundItems.routes");
const claimRoutes = require("./routes/claimRoutes");
const adminClaimRoutes = require("./routes/adminClaims.routes");
const adminUsersRoutes = require("./routes/adminUsers.routes");
const userPostsRoutes = require("./routes/userPosts.routes");
const userResolvedItemsRoutes = require("./routes/user-resolved-items/userResolvedItems.routes");
const searchRoutes = require("./routes/search/search.routes");
const userProfileRoutes = require("./routes/user-profile/userProfile.routes");
const adminReportsRoutes = require("./routes/admin-reports/adminReports.routes");
const adminDashboardRoutes = require("./routes/admin-dashboard/adminDashboard.routes");
const adminNotificationsRoutes = require("./routes/admin-notifications/adminNotifications.routes");

const app = express();
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// =====================
// Middlewares
// =====================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// =====================
// Health check
// =====================
app.get("/", (req, res) => {
  res.send("Lost & Found Nepal API running");
});

// =====================
// Routes
// =====================
app.use("/api/auth", authRoutes);
app.use("/api/lost-items", lostItemsRoutes);
app.use("/api/found-items", foundItemsRoutes);
app.use("/api/claims", claimRoutes);
app.use("/api/admin/claims", adminClaimRoutes);
app.use("/api/admin/users", adminUsersRoutes);
app.use("/api/user-posts", userPostsRoutes);
app.use("/api/user-resolved-items", userResolvedItemsRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/user-profile", userProfileRoutes);
app.use("/api/admin/reports", adminReportsRoutes);
app.use("/api/admin/dashboard", adminDashboardRoutes);
app.use("/api/admin/notifications", adminNotificationsRoutes);
console.log("Mounted admin claims routes at /api/admin/claims");

initSockets(server);

// =====================
// Database + server start
// =====================
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ PostgreSQL connected via Sequelize");

    // Try to align schema in local development without blocking server startup.
    if (process.env.NODE_ENV !== "production") {
      try {
        await sequelize.sync({ alter: true });
        console.log("✅ Sequelize schema sync complete (development)");
      } catch (syncError) {
        console.error("⚠️ Sequelize sync skipped:", syncError.message);
      }
    }

    server.listen(PORT, () => {
      console.log(`🚀 Backend running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start backend:", err);
    process.exit(1);
  }
};

startServer();
