"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("confirmations", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      thread_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "message_threads",
          key: "id",
        },
        onDelete: "CASCADE",
      },

      owner_confirmed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },

      finder_confirmed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("confirmations");
  },
};
