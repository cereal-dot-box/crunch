import type { Kysely } from 'kysely';
import { sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('Session')
    .addColumn('id', 'text', (col) => col.primaryKey().notNull())
    .addColumn('user_id', 'integer', (col) =>
      col.notNull().references('User.id').onDelete('cascade')
    )
    .addColumn('data', 'text')
    .addColumn('created_at', 'text', (col) =>
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
    )
    .addColumn('expires_at', 'text', (col) => col.notNull())
    .addColumn('last_activity_at', 'text', (col) =>
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
    )
    .execute();

  await db.schema
    .createIndex('idx_session_expires')
    .on('Session')
    .column('expires_at')
    .execute();

  await db.schema
    .createIndex('idx_session_user')
    .on('Session')
    .column('user_id')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('Session').execute();
}
