import type { Kysely } from 'kysely';
import { sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Check existing columns
  const tableInfo = await sql<{ name: string }>`PRAGMA table_info(SyncSource)`.execute(db);
  const existingColumns = new Set(tableInfo.rows.map(row => row.name));

  // Add bank column if it doesn't exist
  if (!existingColumns.has('bank')) {
    await db.schema
      .alterTable('SyncSource')
      .addColumn('bank', 'text')
      .execute();
  }

  // Add account_type column if it doesn't exist
  if (!existingColumns.has('account_type')) {
    await db.schema
      .alterTable('SyncSource')
      .addColumn('account_type', 'text')
      .execute();
  }

  // Backfill from linked accounts
  await sql`
    UPDATE SyncSource
    SET bank = (SELECT bank FROM Account WHERE Account.id = SyncSource.account_id),
        account_type = (SELECT type FROM Account WHERE Account.id = SyncSource.account_id)
    WHERE bank IS NULL OR account_type IS NULL
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  // SQLite doesn't support DROP COLUMN directly, but Kysely handles it
  await db.schema
    .alterTable('SyncSource')
    .dropColumn('bank')
    .execute();

  await db.schema
    .alterTable('SyncSource')
    .dropColumn('account_type')
    .execute();
}
