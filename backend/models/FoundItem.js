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

    admin_only_identifiers: {
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
  // Finder (user who found the item)
  FoundItem.belongsTo(models.User, {
    foreignKey: "user_id",
    as: "finder",
  });

  // Claims made on this found item
  FoundItem.hasMany(models.Claim, {
    foreignKey: "found_item_id",
    as: "claims",
  });
};

module.exports = FoundItem;
