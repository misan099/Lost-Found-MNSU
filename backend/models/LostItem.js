"use strict";

const { DataTypes } = require("sequelize");
const sequelize = require("../database/sequelize");

const LostItem = sequelize.define(
  "LostItem",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    item_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    date_lost: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    image_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM("pending", "matched", "resolved"),
      defaultValue: "pending",
    },
  },
  {
    tableName: "lost_items",
    timestamps: true,
    underscored: true,
  }
);
LostItem.associate = (models) => {
  LostItem.belongsTo(models.User, {
    foreignKey: "user_id",
    as: "user",
  });
};

module.exports = LostItem;
