const bcrypt = require("bcryptjs");
const sequelize = require("../database/sequelize");
const User = require("../models/User");

async function createAdmin() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });

    const exists = await User.findOne({ where: { username: "admin" } });
    if (exists) {
      console.log("✅ Admin already exists");
      process.exit();
    }

    const hashedPassword = await bcrypt.hash("admin", 10);

    await User.create({
      username: "admin",
      name: "Admin",
      password: hashedPassword,
      role: "admin",
    });

    console.log("✅ Admin created");
    console.log("👉 username: admin");
    console.log("👉 password: admin");
    process.exit();
  } catch (err) {
    console.error("❌ Error creating admin:", err);
    process.exit(1);
  }
}

createAdmin();
