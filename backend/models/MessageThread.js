"use strict";

const { DataTypes } = require("sequelize");
const sequelize = require("../database/sequelize");

const MessageThread = sequelize.define(
  "MessageThread",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    claim_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM("open", "closed"),
      defaultValue: "open",
    },
  },
  {
    tableName: "message_threads",
    timestamps: true,
    underscored: true,
  }
);




MessageThread.associate = (models) => {
  // Thread belongs to a claim
  MessageThread.belongsTo(models.Claim, {
    foreignKey: "claim_id",
    as: "claim",
  });

  // Messages inside the thread
  MessageThread.hasMany(models.Message, {
    foreignKey: "thread_id",
    as: "messages",
  });

  // Confirmation for resolving the claim
  MessageThread.hasOne(models.Confirmation, {
    foreignKey: "thread_id",
    as: "confirmation",
  });
};

module.exports = MessageThread;
