import type { Kysely } from 'kysely';
import { sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('EmailAlertDLQ')
    .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement().notNull())
    .addColumn('user_id', 'integer', (col) =>
      col.notNull().references('User.id').onDelete('cascade')
    )
    .addColumn('sync_source_id', 'integer', (col) =>
      col.notNull().references('SyncSource.id').onDelete('cascade')
    )
    .addColumn('message_uid', 'text')
    .addColumn('subject', 'text')
    .addColumn('from_address', 'text')
    .addColumn('date', 'text')
    .addColumn('body_text', 'text')
    .addColumn('body_html', 'text')
    .addColumn('error_message', 'text', (col) => col.notNull())
    .addColumn('error_type', 'text', (col) => col.notNull())
    .addColumn('error_stack', 'text')
    .addColumn('created_at', 'text', (col) =>
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
    )
    .execute();

  await db.schema
    .createIndex('idx_dlq_user')
    .on('EmailAlertDLQ')
    .column('user_id')
    .execute();

  await db.schema
    .createIndex('idx_dlq_provider')
    .on('EmailAlertDLQ')
    .column('sync_source_id')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('EmailAlertDLQ').execute();
}
