"use strict";

const { DataTypes } = require("sequelize");
const sequelize = require("../database/sequelize");

const FoundItem = sequelize.define(
  "FoundItem",
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

    area: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    exact_location: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    public_description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    date_found: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    image_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    image_path: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    admin_only_identifiers: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    admin_verification_details: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    hidden_marks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    verification_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM(
        "available",
        "claim_requested",
        "verified",
        "resolved"
      ),
      defaultValue: "available",
    },
  },
  {
    tableName: "found_items",
    timestamps: true,
    underscored: true,
  }
);

FoundItem.associate = (models) => {
  FoundItem.belongsTo(models.User, {
    foreignKey: "user_id",
    as: "user",
  });
};

module.exports = FoundItem;
