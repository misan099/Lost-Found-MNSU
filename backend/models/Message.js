"use strict";

const { DataTypes } = require("sequelize");
const sequelize = require("../database/sequelize");

const Message = sequelize.define(
  "Message",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    thread_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    sender_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    message_text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "messages",
    timestamps: false, // only created_at exists
    underscored: true,
  }
);

Message.associate = (models) => {
  // Message belongs to a thread
  Message.belongsTo(models.MessageThread, {
    foreignKey: "thread_id",
    as: "thread",
  });

  // Sender of the message
  Message.belongsTo(models.User, {
    foreignKey: "sender_id",
    as: "sender",
  });
};


module.exports = Message;
