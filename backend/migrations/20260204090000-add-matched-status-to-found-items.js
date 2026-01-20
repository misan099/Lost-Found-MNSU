"use strict";

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_type t
          JOIN pg_enum e ON t.oid = e.enumtypid
          WHERE t.typname = 'enum_found_items_status'
            AND e.enumlabel = 'matched'
        ) THEN
          ALTER TYPE "enum_found_items_status" ADD VALUE 'matched';
        END IF;
      END
      $$;
    `);
  },

  async down() {
    // No-op: removing enum values in Postgres requires a type rewrite.
  },
};
