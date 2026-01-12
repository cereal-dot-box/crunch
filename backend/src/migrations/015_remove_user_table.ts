import type { Kysely } from 'kysely';
import { sql } from 'kysely';

/**
 * Migration: Remove User table and foreign key constraints
 *
 * Since the auth service (Better Auth) is the source of truth for users,
 * the backend's User table is redundant. We remove it and make user_id
 * a plain text field without FK constraints in all tables.
 */
export async function up(db: Kysely<any>): Promise<void> {
  await sql`PRAGMA foreign_keys = OFF`.execute(db);

  // ============================================
  // Recreate tables WITHOUT FK constraints to User
  // ============================================

  // Session table (remove FK to User)
  await sql`
    CREATE TABLE "Session_new" (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL,
      data TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      expires_at TEXT NOT NULL,
      last_activity_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `.execute(db);
  await sql`INSERT INTO "Session_new" SELECT * FROM "Session"`.execute(db);
  await sql`DROP TABLE "Session"`.execute(db);
  await sql`ALTER TABLE "Session_new" RENAME TO "Session"`.execute(db);
  await sql`CREATE INDEX "idx_session_expires" ON "Session"(expires_at)`.execute(db);
  await sql`CREATE INDEX "idx_session_user" ON "Session"(user_id)`.execute(db);

  // Account table (remove FK to User)
  await sql`
    CREATE TABLE "Account_new" (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      bank TEXT,
      type TEXT,
      mask TEXT,
      iso_currency_code TEXT NOT NULL DEFAULT 'CAD',
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `.execute(db);
  await sql`INSERT INTO "Account_new" SELECT * FROM "Account"`.execute(db);
  await sql`DROP TABLE "Account"`.execute(db);
  await sql`ALTER TABLE "Account_new" RENAME TO "Account"`.execute(db);
  await sql`CREATE INDEX "idx_account_user" ON "Account"(user_id)`.execute(db);

  // BudgetBucket table (remove FK to User)
  await sql`
    CREATE TABLE "BudgetBucket_new" (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      user_id TEXT NOT NULL,
      bucket_id TEXT NOT NULL,
      name TEXT NOT NULL,
      monthly_limit REAL NOT NULL,
      color TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `.execute(db);
  await sql`INSERT INTO "BudgetBucket_new" SELECT * FROM "BudgetBucket"`.execute(db);
  await sql`DROP TABLE "BudgetBucket"`.execute(db);
  await sql`ALTER TABLE "BudgetBucket_new" RENAME TO "BudgetBucket"`.execute(db);
  await sql`CREATE UNIQUE INDEX "idx_budget_bucket_user_bucket" ON "BudgetBucket"("user_id", "bucket_id")`.execute(db);
  await sql`CREATE INDEX "idx_budget_bucket_user" ON "BudgetBucket"(user_id)`.execute(db);

  // BalanceUpdate table (remove FK to User)
  await sql`
    CREATE TABLE "BalanceUpdate_new" (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      user_id TEXT NOT NULL,
      account_id INTEGER NOT NULL,
      processed_email_id INTEGER,
      sync_source_id INTEGER,
      balance_type TEXT NOT NULL,
      new_balance REAL NOT NULL,
      update_source TEXT NOT NULL,
      source_detail TEXT,
      update_date TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (account_id) REFERENCES "Account"(id) ON DELETE CASCADE,
      FOREIGN KEY (processed_email_id) REFERENCES "ProcessedEmails"(id) ON DELETE CASCADE
    )
  `.execute(db);
  await sql`INSERT INTO "BalanceUpdate_new" SELECT * FROM "BalanceUpdate"`.execute(db);
  await sql`DROP TABLE "BalanceUpdate"`.execute(db);
  await sql`ALTER TABLE "BalanceUpdate_new" RENAME TO "BalanceUpdate"`.execute(db);
  await sql`CREATE INDEX "idx_balance_update_user" ON "BalanceUpdate"(user_id)`.execute(db);
  await sql`CREATE INDEX "idx_balance_update_account" ON "BalanceUpdate"(account_id)`.execute(db);
  await sql`CREATE INDEX "idx_balance_update_date" ON "BalanceUpdate"(update_date)`.execute(db);

  // Transaction table (remove FK to User)
  await sql`
    CREATE TABLE "Transaction_new" (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      user_id TEXT NOT NULL,
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
      FOREIGN KEY (account_id) REFERENCES "Account"(id) ON DELETE CASCADE,
      FOREIGN KEY (processed_email_id) REFERENCES "ProcessedEmails"(id) ON DELETE CASCADE,
      FOREIGN KEY (sync_source_id) REFERENCES "SyncSource"(id) ON DELETE CASCADE
    )
  `.execute(db);
  await sql`INSERT INTO "Transaction_new" SELECT * FROM "Transaction"`.execute(db);
  await sql`DROP TABLE "Transaction"`.execute(db);
  await sql`ALTER TABLE "Transaction_new" RENAME TO "Transaction"`.execute(db);
  await sql`CREATE INDEX "idx_transaction_user" ON "Transaction"(user_id)`.execute(db);
  await sql`CREATE INDEX "idx_transaction_account" ON "Transaction"(account_id)`.execute(db);
  await sql`CREATE INDEX "idx_transaction_processed_email" ON "Transaction"(processed_email_id)`.execute(db);
  await sql`CREATE INDEX "idx_transaction_sync_source" ON "Transaction"(sync_source_id)`.execute(db);
  await sql`CREATE INDEX "idx_transaction_date" ON "Transaction"(transaction_date)`.execute(db);
  await sql`CREATE INDEX "idx_transaction_account_date" ON "Transaction"(account_id, transaction_date)`.execute(db);

  // ProcessedEmails table (remove FK to User)
  await sql`
    CREATE TABLE "ProcessedEmails_new" (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      user_id TEXT NOT NULL,
      sync_source_id INTEGER NOT NULL,
      message_uid TEXT NOT NULL,
      content_hash TEXT,
      processed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sync_source_id) REFERENCES "SyncSource"(id) ON DELETE CASCADE
    )
  `.execute(db);
  await sql`INSERT INTO "ProcessedEmails_new" SELECT * FROM "ProcessedEmails"`.execute(db);
  await sql`DROP TABLE "ProcessedEmails"`.execute(db);
  await sql`ALTER TABLE "ProcessedEmails_new" RENAME TO "ProcessedEmails"`.execute(db);
  await sql`CREATE UNIQUE INDEX "idx_processed_emails_source_uid" ON "ProcessedEmails"(sync_source_id, message_uid)`.execute(db);
  await sql`CREATE INDEX "idx_processed_emails_user" ON "ProcessedEmails"(user_id)`.execute(db);

  // EmailAlertDLQ table (remove FK to User)
  await sql`
    CREATE TABLE "EmailAlertDLQ_new" (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      user_id TEXT NOT NULL,
      sync_source_id INTEGER NOT NULL,
      message_uid TEXT,
      subject TEXT,
      from_address TEXT,
      date TEXT,
      body_text TEXT,
      body_html TEXT,
      error_message TEXT NOT NULL,
      error_type TEXT NOT NULL,
      error_stack TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sync_source_id) REFERENCES "SyncSource"(id) ON DELETE CASCADE
    )
  `.execute(db);
  await sql`INSERT INTO "EmailAlertDLQ_new" SELECT * FROM "EmailAlertDLQ"`.execute(db);
  await sql`DROP TABLE "EmailAlertDLQ"`.execute(db);
  await sql`ALTER TABLE "EmailAlertDLQ_new" RENAME TO "EmailAlertDLQ"`.execute(db);
  await sql`CREATE INDEX "idx_email_alert_dlq_user" ON "EmailAlertDLQ"(user_id)`.execute(db);
  await sql`CREATE INDEX "idx_email_alert_dlq_source" ON "EmailAlertDLQ"(sync_source_id)`.execute(db);
  await sql`CREATE INDEX "idx_email_alert_dlq_error_type" ON "EmailAlertDLQ"(error_type)`.execute(db);

  // MonthlyPeriod table (remove FK to User)
  await sql`
    CREATE TABLE "MonthlyPeriod_new" (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      user_id TEXT NOT NULL,
      month TEXT NOT NULL,
      projected_income REAL NOT NULL,
      actual_income REAL NOT NULL,
      status TEXT NOT NULL,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `.execute(db);
  await sql`INSERT INTO "MonthlyPeriod_new" SELECT * FROM "MonthlyPeriod"`.execute(db);
  await sql`DROP TABLE "MonthlyPeriod"`.execute(db);
  await sql`ALTER TABLE "MonthlyPeriod_new" RENAME TO "MonthlyPeriod"`.execute(db);
  await sql`CREATE UNIQUE INDEX "idx_monthly_period_user_month" ON "MonthlyPeriod"(user_id, month)`.execute(db);
  await sql`CREATE INDEX "idx_monthly_period_user" ON "MonthlyPeriod"(user_id)`.execute(db);

  // ============================================
  // Drop the User table
  // ============================================
  await sql`DROP TABLE IF EXISTS "User"`.execute(db);

  await sql`PRAGMA foreign_keys = ON`.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  // Revert - recreate User table and add back FK constraints
  // This would be complex since we'd need to reconstruct user data
  // For now, this migration is essentially one-way
  await sql`PRAGMA foreign_keys = OFF`.execute(db);

  // Recreate User table
  await sql`
    CREATE TABLE "User" (
      id TEXT PRIMARY KEY NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `.execute(db);

  await sql`PRAGMA foreign_keys = ON`.execute(db);
}
