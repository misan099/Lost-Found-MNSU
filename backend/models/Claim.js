~"use strict";

const { DataTypes } = require("sequelize");
const sequelize = require("../database/sequelize");

const Claim = sequelize.define(
  "Claim",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    found_item_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    claimant_user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    verification_text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
    },

    admin_note: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "claims",
    timestamps: true,
    underscored: true,
  }
);


Claim.associate = (models) => {
  // The found item being claimed
  Claim.belongsTo(models.FoundItem, {
    foreignKey: "found_item_id",
    as: "foundItem",
  });

  // The user who is claiming the item
  Claim.belongsTo(models.User, {
    foreignKey: "claimant_user_id",
    as: "claimant",
  });

  // One discussion thread per claim
  Claim.hasOne(models.MessageThread, {
    foreignKey: "claim_id",
    as: "thread",
  });
};

module.exports = Claim;
