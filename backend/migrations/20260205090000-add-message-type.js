"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("messages");

    if (!table.type) {
      await queryInterface.sequelize.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1
            FROM pg_type t
            WHERE t.typname = 'enum_messages_type'
          ) THEN
            CREATE TYPE "enum_messages_type" AS ENUM ('user', 'system');
          END IF;
        END
        $$;
      `);

      await queryInterface.addColumn("messages", "type", {
        type: Sequelize.ENUM("user", "system"),
        allowNull: false,
        defaultValue: "user",
      });
    }

    await queryInterface.sequelize.query(`
      UPDATE messages
      SET sender_role = 'owner'
      WHERE sender_role = 'lost_owner';
    `);

    await queryInterface.sequelize.query(`
      UPDATE messages
      SET sender_role = 'finder'
      WHERE sender_role = 'found_owner';
    `);

    await queryInterface.sequelize.query(`
      UPDATE messages
      SET type = 'system'
      WHERE sender_role = 'admin';
    `);
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable("messages");
    if (table.type) {
      await queryInterface.removeColumn("messages", "type");
    }
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_messages_type";'
    );
  },
};
