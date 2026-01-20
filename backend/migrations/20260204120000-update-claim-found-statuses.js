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
          WHERE t.typname = 'enum_claims_status'
            AND e.enumlabel = 'verified'
        ) THEN
          ALTER TYPE "enum_claims_status" ADD VALUE 'verified';
        END IF;
        IF NOT EXISTS (
          SELECT 1
          FROM pg_type t
          JOIN pg_enum e ON t.oid = e.enumtypid
          WHERE t.typname = 'enum_claims_status'
            AND e.enumlabel = 'awaiting_admin_resolution'
        ) THEN
          ALTER TYPE "enum_claims_status" ADD VALUE 'awaiting_admin_resolution';
        END IF;
        IF NOT EXISTS (
          SELECT 1
          FROM pg_type t
          JOIN pg_enum e ON t.oid = e.enumtypid
          WHERE t.typname = 'enum_claims_status'
            AND e.enumlabel = 'resolved'
        ) THEN
          ALTER TYPE "enum_claims_status" ADD VALUE 'resolved';
        END IF;
      END
      $$;
    `);

    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_type t
          JOIN pg_enum e ON t.oid = e.enumtypid
          WHERE t.typname = 'enum_found_items_status'
            AND e.enumlabel = 'verified'
        ) THEN
          ALTER TYPE "enum_found_items_status" ADD VALUE 'verified';
        END IF;
      END
      $$;
    `);

    await queryInterface.sequelize.query(`
      UPDATE claims
      SET status = 'verified'
      WHERE status = 'approved';
    `);

    await queryInterface.sequelize.query(`
      UPDATE found_items
      SET status = 'verified'
      WHERE status = 'matched';
    `);

    await queryInterface.sequelize.query(`
      UPDATE claims
      SET status = 'resolved'
      WHERE status IN ('approved', 'verified')
        AND EXISTS (
          SELECT 1
          FROM found_items
          WHERE found_items.id = claims.found_item_id
            AND found_items.status = 'resolved'
        );
    `);
  },

  async down() {
    // No-op: enum value removal requires a type rewrite in Postgres.
  },
};
