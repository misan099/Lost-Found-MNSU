"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("messages", "claim_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "claims",
        key: "id",
      },
      onDelete: "CASCADE",
    });

    await queryInterface.addColumn("messages", "sender_role", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("messages", "sender_role");
    await queryInterface.removeColumn("messages", "claim_id");
  },
};
