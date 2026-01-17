import type { Kysely } from 'kysely';
import { sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('SplitwiseCredential')
    .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement().notNull())
    .addColumn('user_id', 'text', (col) => col.notNull())
    .addColumn('access_token', 'text', (col) => col.notNull()) // Encrypted
    .addColumn('refresh_token', 'text') // Encrypted (if Splitwise provides it) - nullable by default
    .addColumn('token_type', 'text', (col) => col.notNull().defaultTo('Bearer'))
    .addColumn('expires_at', 'text') // ISO timestamp when token expires - nullable by default
    .addColumn('splitwise_user_id', 'text', (col) => col.notNull())
    .addColumn('created_at', 'text', (col) =>
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
    )
    .addColumn('updated_at', 'text', (col) =>
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
    )
    .execute();

  await db.schema
    .createIndex('idx_splitwise_credential_user_id')
    .on('SplitwiseCredential')
    .column('user_id')
    .execute();

  await db.schema
    .createIndex('idx_splitwise_credential_splitwise_user_id')
    .on('SplitwiseCredential')
    .column('splitwise_user_id')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('SplitwiseCredential').execute();
}
