import type { Kysely } from 'kysely';
import { sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('BalanceUpdate')
    .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement().notNull())
    .addColumn('user_id', 'integer', (col) =>
      col.notNull().references('User.id').onDelete('cascade')
    )
    .addColumn('account_id', 'integer', (col) =>
      col.notNull().references('Account.id').onDelete('cascade')
    )
    .addColumn('processed_email_id', 'integer', (col) =>
      col.references('ProcessedEmails.id').onDelete('cascade')
    )
    .addColumn('sync_source_id', 'integer', (col) =>
      col.references('SyncSource.id').onDelete('cascade')
    )
    .addColumn('balance_type', 'text', (col) => col.notNull())
    .addColumn('new_balance', 'real', (col) => col.notNull())
    .addColumn('update_source', 'text', (col) => col.notNull().defaultTo('email'))
    .addColumn('source_detail', 'text')
    .addColumn('update_date', 'text', (col) => col.notNull())
    .addColumn('created_at', 'text', (col) =>
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
    )
    .execute();

  await db.schema
    .createIndex('idx_balance_update_user')
    .on('BalanceUpdate')
    .column('user_id')
    .execute();

  await db.schema
    .createIndex('idx_balance_update_account')
    .on('BalanceUpdate')
    .column('account_id')
    .execute();

  await db.schema
    .createIndex('idx_balance_update_processed_email')
    .on('BalanceUpdate')
    .column('processed_email_id')
    .execute();

  await db.schema
    .createIndex('idx_balance_update_type')
    .on('BalanceUpdate')
    .column('balance_type')
    .execute();

  await sql`CREATE INDEX "idx_balance_update_account_date" ON "BalanceUpdate" ("account_id", "update_date")`.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('BalanceUpdate').execute();
}
