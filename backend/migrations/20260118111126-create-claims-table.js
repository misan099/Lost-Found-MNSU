"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("claims", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      found_item_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "found_items", // ✅ EXACT table name in DB
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },

      claimant_user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users", // ✅ correct users table
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },

      verification_text: {
        type: Sequelize.TEXT,
        allowNull: false,
      },

      status: {
        type: Sequelize.ENUM("pending", "approved", "rejected"),
        allowNull: false,
        defaultValue: "pending",
      },

      admin_note: {
        type: Sequelize.TEXT,
        allowNull: true,
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
    await queryInterface.dropTable("claims");
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_claims_status";'
    );
  },
};
