import type { Kysely } from 'kysely';
import { sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // SQLite doesn't support dropping columns with UNIQUE constraints directly
  // We need to recreate the table without the account_id column

  // Get existing data
  const existingData = await sql`SELECT * FROM Account`.execute(db);
  const rows = existingData.rows;

  // Create new table without account_id column
  await sql`
    CREATE TABLE "Account_new" (
      "id" integer not null primary key autoincrement,
      "user_id" integer not null references "User" ("id") on delete cascade,
      "name" text not null,
      "bank" text,
      "type" text,
      "mask" text,
      "iso_currency_code" text default 'CAD' not null,
      "is_active" integer default 1 not null,
      "created_at" text default CURRENT_TIMESTAMP not null,
      "updated_at" text default CURRENT_TIMESTAMP not null
    )
  `.execute(db);

  // Copy data from old table to new table (excluding account_id)
  await sql`
    INSERT INTO "Account_new" (id, user_id, name, bank, type, mask, iso_currency_code, is_active, created_at, updated_at)
    SELECT id, user_id, name, bank, type, mask, iso_currency_code, is_active, created_at, updated_at
    FROM "Account"
  `.execute(db);

  // Drop old table
  await sql`DROP TABLE "Account"`.execute(db);

  // Rename new table to original name
  await sql`ALTER TABLE "Account_new" RENAME TO "Account"`.execute(db);

  // Recreate indexes
  await sql`CREATE INDEX "idx_account_user" on "Account" ("user_id")`.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  // To rollback, recreate the table with account_id column
  // Get existing data
  const existingData = await sql`SELECT * FROM Account`.execute(db);
  const rows = existingData.rows;

  // Create new table with account_id column
  await sql`
    CREATE TABLE "Account_new" (
      "id" integer not null primary key autoincrement,
      "user_id" integer not null references "User" ("id") on delete cascade,
      "account_id" text unique,
      "name" text not null,
      "bank" text,
      "type" text,
      "mask" text,
      "iso_currency_code" text default 'CAD' not null,
      "is_active" integer default 1 not null,
      "created_at" text default CURRENT_TIMESTAMP not null,
      "updated_at" text default CURRENT_TIMESTAMP not null
    )
  `.execute(db);

  // Copy data from old table to new table (account_id will be NULL)
  await sql`
    INSERT INTO "Account_new" (id, user_id, account_id, name, bank, type, mask, iso_currency_code, is_active, created_at, updated_at)
    SELECT id, user_id, NULL, name, bank, type, mask, iso_currency_code, is_active, created_at, updated_at
    FROM "Account"
  `.execute(db);

  // Drop old table
  await sql`DROP TABLE "Account"`.execute(db);

  // Rename new table to original name
  await sql`ALTER TABLE "Account_new" RENAME TO "Account"`.execute(db);

  // Recreate indexes
  await sql`CREATE INDEX "idx_account_user" on "Account" ("user_id")`.execute(db);
}
