import type { Kysely } from 'kysely';
import { sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('ProcessedEmails')
    .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement().notNull())
    .addColumn('user_id', 'integer', (col) =>
      col.notNull().references('User.id').onDelete('cascade')
    )
    .addColumn('sync_source_id', 'integer', (col) =>
      col.notNull().references('SyncSource.id').onDelete('cascade')
    )
    .addColumn('message_uid', 'text', (col) => col.notNull())
    .addColumn('content_hash', 'text')
    .addColumn('processed_at', 'text', (col) =>
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
    )
    .execute();

  await sql`CREATE UNIQUE INDEX "uq_processed_email" ON "ProcessedEmails" ("sync_source_id", "message_uid")`.execute(db);

  await db.schema
    .createIndex('idx_processed_emails_provider')
    .on('ProcessedEmails')
    .column('sync_source_id')
    .execute();

  await db.schema
    .createIndex('idx_processed_emails_user')
    .on('ProcessedEmails')
    .column('user_id')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('ProcessedEmails').execute();
}
