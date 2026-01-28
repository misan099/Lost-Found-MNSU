"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("users", "status", {
      type: Sequelize.ENUM("active", "suspended", "blocked"),
      allowNull: false,
      defaultValue: "active",
    });

    await queryInterface.addColumn("users", "suspended_until", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn("users", "suspension_note", {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn("users", "blocked_note", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("users", "blocked_note");
    await queryInterface.removeColumn("users", "suspension_note");
    await queryInterface.removeColumn("users", "suspended_until");
    await queryInterface.removeColumn("users", "status");

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_users_status";'
    );
  },
};
