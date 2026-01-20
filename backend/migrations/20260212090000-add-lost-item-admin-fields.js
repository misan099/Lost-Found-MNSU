"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("lost_items");

    if (!table.area) {
      await queryInterface.addColumn("lost_items", "area", {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }

    if (!table.exact_location) {
      await queryInterface.addColumn("lost_items", "exact_location", {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }

    if (!table.public_description) {
      await queryInterface.addColumn("lost_items", "public_description", {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    }

    if (!table.image_path) {
      await queryInterface.addColumn("lost_items", "image_path", {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }

    if (!table.admin_verification_details) {
      await queryInterface.addColumn(
        "lost_items",
        "admin_verification_details",
        {
          type: Sequelize.TEXT,
          allowNull: true,
        }
      );
    }

    if (!table.hidden_marks) {
      await queryInterface.addColumn("lost_items", "hidden_marks", {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    }

    if (!table.verification_notes) {
      await queryInterface.addColumn("lost_items", "verification_notes", {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable("lost_items");

    if (table.verification_notes) {
      await queryInterface.removeColumn(
        "lost_items",
        "verification_notes"
      );
    }
    if (table.hidden_marks) {
      await queryInterface.removeColumn("lost_items", "hidden_marks");
    }
    if (table.admin_verification_details) {
      await queryInterface.removeColumn(
        "lost_items",
        "admin_verification_details"
      );
    }
    if (table.image_path) {
      await queryInterface.removeColumn("lost_items", "image_path");
    }
    if (table.public_description) {
      await queryInterface.removeColumn(
        "lost_items",
        "public_description"
      );
    }
    if (table.exact_location) {
      await queryInterface.removeColumn(
        "lost_items",
        "exact_location"
      );
    }
    if (table.area) {
      await queryInterface.removeColumn("lost_items", "area");
    }
  },
};
