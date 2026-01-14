const { DataTypes } = require("sequelize");
const sequelize = require("../database/sequelize");

const User = sequelize.define(
  "User",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

    // Admin can use username (optional for normal users)
    username: { type: DataTypes.STRING, allowNull: true, unique: true },

    // Normal users will use email (optional for admin if you want)
    email: { type: DataTypes.STRING, allowNull: true, unique: true },

    name: { type: DataTypes.STRING, allowNull: false },

    password: { type: DataTypes.STRING, allowNull: false },

    role: {
      type: DataTypes.ENUM("user", "admin"),
      allowNull: false,
      defaultValue: "user",
    },

    securityQuestion: { type: DataTypes.STRING, allowNull: true },
    securityAnswerHash: { type: DataTypes.STRING, allowNull: true },
  },
  { tableName: "users", timestamps: true }
);

module.exports = User;
