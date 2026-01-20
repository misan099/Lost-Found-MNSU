"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("claims");

    if (!table.lost_item_id) {
      await queryInterface.addColumn("claims", "lost_item_id", {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "lost_items",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }

    if (table.found_item_id && table.found_item_id.allowNull === false) {
      await queryInterface.changeColumn("claims", "found_item_id", {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "found_items",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("claims");

    if (table.lost_item_id) {
      await queryInterface.removeColumn("claims", "lost_item_id");
    }

    if (table.found_item_id) {
      await queryInterface.changeColumn("claims", "found_item_id", {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "found_items",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }
  },
};
