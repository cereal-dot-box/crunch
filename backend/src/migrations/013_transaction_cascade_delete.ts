import type { Kysely } from 'kysely';
import { sql } from 'kysely';

/**
 * Fix Transaction.processed_email_id foreign key to use CASCADE delete
 * instead of SET NULL, so transactions are deleted when their processed
 * email is deleted.
 */
export async function up(db: Kysely<any>): Promise<void> {
  // SQLite doesn't support ALTER TABLE to modify foreign key constraints,
  // so we need to recreate the table
  await sql`
    CREATE TABLE "Transaction_new" (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      account_id INTEGER NOT NULL,
      processed_email_id INTEGER,
      sync_source_id INTEGER,
      amount REAL NOT NULL,
      iso_currency_code TEXT NOT NULL DEFAULT 'CAD',
      transaction_date TEXT NOT NULL,
      authorized_date TEXT,
      name TEXT NOT NULL,
      merchant_name TEXT,
      pending INTEGER NOT NULL DEFAULT 0,
      payment_channel TEXT,
      category TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES "User"(id) ON DELETE CASCADE,
      FOREIGN KEY (account_id) REFERENCES "Account"(id) ON DELETE CASCADE,
      FOREIGN KEY (processed_email_id) REFERENCES "ProcessedEmails"(id) ON DELETE CASCADE,
      FOREIGN KEY (sync_source_id) REFERENCES "SyncSource"(id) ON DELETE CASCADE
    )
  `.execute(db);

  // Copy data from old table to new table
  await sql`
    INSERT INTO "Transaction_new"
    SELECT * FROM "Transaction"
  `.execute(db);

  // Drop old table
  await sql`DROP TABLE "Transaction"`.execute(db);

  // Rename new table to original name
  await sql`ALTER TABLE "Transaction_new" RENAME TO "Transaction"`.execute(db);

  // Recreate indexes
  await sql`CREATE INDEX "idx_transaction_user" ON "Transaction"(user_id)`.execute(db);
  await sql`CREATE INDEX "idx_transaction_account" ON "Transaction"(account_id)`.execute(db);
  await sql`CREATE INDEX "idx_transaction_processed_email" ON "Transaction"(processed_email_id)`.execute(db);
  await sql`CREATE INDEX "idx_transaction_sync_source" ON "Transaction"(sync_source_id)`.execute(db);
  await sql`CREATE INDEX "idx_transaction_date" ON "Transaction"(transaction_date)`.execute(db);
  await sql`CREATE INDEX "idx_transaction_account_date" ON "Transaction"(account_id, transaction_date)`.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  // Revert to SET NULL behavior
  await sql`
    CREATE TABLE "Transaction_new" (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      account_id INTEGER NOT NULL,
      processed_email_id INTEGER,
      sync_source_id INTEGER,
      amount REAL NOT NULL,
      iso_currency_code TEXT NOT NULL DEFAULT 'CAD',
      transaction_date TEXT NOT NULL,
      authorized_date TEXT,
      name TEXT NOT NULL,
      merchant_name TEXT,
      pending INTEGER NOT NULL DEFAULT 0,
      payment_channel TEXT,
      category TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES "User"(id) ON DELETE CASCADE,
      FOREIGN KEY (account_id) REFERENCES "Account"(id) ON DELETE CASCADE,
      FOREIGN KEY (processed_email_id) REFERENCES "ProcessedEmails"(id) ON DELETE SET NULL,
      FOREIGN KEY (sync_source_id) REFERENCES "SyncSource"(id) ON DELETE CASCADE
    )
  `.execute(db);

  await sql`
    INSERT INTO "Transaction_new"
    SELECT * FROM "Transaction"
  `.execute(db);

  await sql`DROP TABLE "Transaction"`.execute(db);
  await sql`ALTER TABLE "Transaction_new" RENAME TO "Transaction"`.execute(db);

  await sql`CREATE INDEX "idx_transaction_user" ON "Transaction"(user_id)`.execute(db);
  await sql`CREATE INDEX "idx_transaction_account" ON "Transaction"(account_id)`.execute(db);
  await sql`CREATE INDEX "idx_transaction_processed_email" ON "Transaction"(processed_email_id)`.execute(db);
  await sql`CREATE INDEX "idx_transaction_sync_source" ON "Transaction"(sync_source_id)`.execute(db);
  await sql`CREATE INDEX "idx_transaction_date" ON "Transaction"(transaction_date)`.execute(db);
  await sql`CREATE INDEX "idx_transaction_account_date" ON "Transaction"(account_id, transaction_date)`.execute(db);
}
