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
console.log("Mounted admin claims routes at /api/admin/claims");

initSockets(server);

// =====================
// Database
// =====================
sequelize.authenticate()
  .then(() => console.log("✅ PostgreSQL connected via Sequelize"))
  .catch((err) => console.error("❌ DB connection error:", err));

// =====================
// Server start
// =====================
server.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
