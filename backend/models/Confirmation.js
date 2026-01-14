"use strict";

const { DataTypes } = require("sequelize");
const sequelize = require("../database/sequelize");

const Confirmation = sequelize.define(
  "Confirmation",
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

    owner_confirmed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    finder_confirmed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "confirmations",
    timestamps: true,
    underscored: true,
  }
);

Confirmation.associate = (models) => {
  Confirmation.belongsTo(models.MessageThread, {
    foreignKey: "thread_id",
    as: "thread",
  });
};

module.exports = Confirmation;
