import type { Kysely } from 'kysely';
import { sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await sql`
    CREATE TABLE "Transaction" (
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

  await sql`CREATE INDEX "idx_transaction_user" ON "Transaction"(user_id)`.execute(db);
  await sql`CREATE INDEX "idx_transaction_account" ON "Transaction"(account_id)`.execute(db);
  await sql`CREATE INDEX "idx_transaction_processed_email" ON "Transaction"(processed_email_id)`.execute(db);
  await sql`CREATE INDEX "idx_transaction_sync_source" ON "Transaction"(sync_source_id)`.execute(db);
  await sql`CREATE INDEX "idx_transaction_date" ON "Transaction"(transaction_date)`.execute(db);
  await sql`CREATE INDEX "idx_transaction_account_date" ON "Transaction"(account_id, transaction_date)`.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`DROP TABLE IF EXISTS "Transaction"`.execute(db);
}
