"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("found_items", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
      },

      item_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      category: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      public_description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },

      location: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      date_found: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      image_url: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      admin_only_identifiers: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      status: {
  type: Sequelize.ENUM(
    "available",
    "claim_requested",
    "matched",
    "resolved"
  ),
  defaultValue: "available",
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
    await queryInterface.dropTable("found_items");
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_found_items_status";'
    );
  },
};
