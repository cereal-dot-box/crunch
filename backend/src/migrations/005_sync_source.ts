import type { Kysely } from 'kysely';
import { sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('SyncSource')
    .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement().notNull())
    .addColumn('account_id', 'integer', (col) =>
      col.notNull().references('Account.id').onDelete('cascade')
    )
    .addColumn('name', 'text', (col) => col.notNull())
    .addColumn('type', 'text', (col) => col.notNull().defaultTo('balance'))
    .addColumn('email_address', 'text', (col) => col.notNull())
    .addColumn('imap_host', 'text', (col) => col.notNull())
    .addColumn('imap_port', 'integer', (col) => col.notNull())
    .addColumn('imap_password_encrypted', 'text', (col) => col.notNull())
    .addColumn('imap_folder', 'text', (col) => col.notNull().defaultTo('INBOX'))
    .addColumn('last_processed_uid', 'text')
    .addColumn('status', 'text', (col) => col.notNull().defaultTo('active'))
    .addColumn('last_synced_at', 'text')
    .addColumn('is_active', 'integer', (col) => col.notNull().defaultTo(1))
    .addColumn('created_at', 'text', (col) =>
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
    )
    .execute();

  await db.schema
    .createIndex('idx_sync_source_account')
    .on('SyncSource')
    .column('account_id')
    .execute();

  await db.schema
    .createIndex('idx_sync_source_provider_name')
    .on('SyncSource')
    .column('name')
    .execute();

  await db.schema
    .createIndex('idx_sync_source_status')
    .on('SyncSource')
    .column('status')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('SyncSource').execute();
}
