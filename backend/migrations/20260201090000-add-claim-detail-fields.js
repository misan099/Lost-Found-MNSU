"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("claims", "verification_type", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("claims", "additional_context", {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn("claims", "proof_image_url", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("claims", "proof_image_url");
    await queryInterface.removeColumn("claims", "additional_context");
    await queryInterface.removeColumn("claims", "verification_type");
  },
};
