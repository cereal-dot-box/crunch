import type { Kysely } from 'kysely';
import { sql } from 'kysely';

/**
 * Migration: Create SplitwiseSetting table
 *
 * This migration creates a table to store user preferences for Splitwise integration,
 * including which groups to include in expense syncing and auto-sync settings.
 */
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('SplitwiseSetting')
    .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement().notNull())
    .addColumn('user_id', 'text', (col) => col.notNull().unique())
    .addColumn('included_group_ids', 'text', (col) => col.notNull().defaultTo('[]')) // JSON array of group IDs
    .addColumn('auto_sync_enabled', 'integer', (col) => col.notNull().defaultTo(0)) // Boolean as integer
    .addColumn('created_at', 'text', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updated_at', 'text', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute();

  await db.schema
    .createIndex('idx_splitwise_setting_user_id')
    .on('SplitwiseSetting')
    .column('user_id')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('SplitwiseSetting').execute();
}
