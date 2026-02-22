"use strict";

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
      allowNull: true,
      references: {
        model: "found_items", // ƒo. MUST MATCH ACTUAL TABLE NAME
        key: "id",
      },
      onDelete: "CASCADE",
    },

    lost_item_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "lost_items",
        key: "id",
      },
      onDelete: "CASCADE",
    },

    claimant_user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    },

    verification_text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    verification_type: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    additional_context: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    proof_image_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM(
        "pending",
        "verified",
        "awaiting_admin_resolution",
        "rejected",
        "resolved"
      ),
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

/* =====================
   Associations
===================== */
Claim.associate = (models) => {
  // dY"- Claim ƒ+' Found Item
  Claim.belongsTo(models.FoundItem, {
    foreignKey: "found_item_id",
    as: "foundItem",
  });

  // dY"- Claim ƒ+' Lost Item
  Claim.belongsTo(models.LostItem, {
    foreignKey: "lost_item_id",
    as: "lostItem",
  });

  // dY"- Claim ƒ+' User
  Claim.belongsTo(models.User, {
    foreignKey: "claimant_user_id",
    as: "claimant",
  });

  // dY"- Claim ƒ+' Message Thread
  Claim.hasOne(models.MessageThread, {
    foreignKey: "claim_id",
    as: "thread",
  });
};

module.exports = Claim;
