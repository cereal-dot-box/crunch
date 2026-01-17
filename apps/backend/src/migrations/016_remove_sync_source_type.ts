import type { Kysely } from 'kysely';

/**
 * Migration: Remove type field from sync sources
 *
 * This migration:
 * 1. Deletes all existing sync source data (users will recreate them)
 * 2. Removes the 'type' column from the SyncSource table
 *
 * The reason for deleting all sync sources is that the architecture is changing
 * from having multiple sync sources per account (one for transactions, one for balance)
 * to having a single sync source per account that handles all email types via
 * content-based parser detection.
 */
export async function up(db: Kysely<any>): Promise<void> {
  // Delete all existing sync sources
  await db.deleteFrom('SyncSource').execute();

  // Remove the type column from SyncSource table
  await db.schema
    .alterTable('SyncSource')
    .dropColumn('type')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // Re-add the type column
  await db.schema
    .alterTable('SyncSource')
    .addColumn('type', 'text', (col) => col.notNull().defaultTo('balance'))
    .execute();
}
