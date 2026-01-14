"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("message_threads", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      claim_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "claims",
          key: "id",
        },
        onDelete: "CASCADE",
      },

      status: {
        type: Sequelize.ENUM("open", "closed"),
        defaultValue: "open",
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
    await queryInterface.dropTable("message_threads");
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_message_threads_status";'
    );
  },
};
