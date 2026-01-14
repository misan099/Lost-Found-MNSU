const express = require("express");
const cors = require("cors");
require("dotenv").config();

const sequelize = require("./database/sequelize");

// 🔹 IMPORTANT: load models & associations
require("./models");

const authRoutes = require("./routes/authRoutes");
const lostItemsRoutes = require("./routes/lostItems.routes");







const app = express();
const PORT = process.env.PORT || 5000;

// =====================
// Middlewares
// =====================
app.use(cors());
app.use(express.json());

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





// =====================
// Database
// =====================
sequelize
  .authenticate()
  .then(() => {
    console.log("✅ PostgreSQL connected via Sequelize");
  })
  .catch((err) => {
    console.error("❌ DB connection error:", err);
  });

// =====================
// Server start
// =====================
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
