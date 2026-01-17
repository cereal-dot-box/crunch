import type { Kysely } from 'kysely';
import { sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await sql`
    CREATE TABLE "MonthlyPeriod" (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      month TEXT NOT NULL,
      projected_income REAL NOT NULL DEFAULT 0,
      actual_income REAL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'open',
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES "User"(id) ON DELETE CASCADE,
      UNIQUE(user_id, month)
    )
  `.execute(db);

  await sql`CREATE INDEX "idx_monthly_period_user" ON "MonthlyPeriod"(user_id)`.execute(db);
  await sql`CREATE INDEX "idx_monthly_period_month" ON "MonthlyPeriod"(month)`.execute(db);
  await sql`CREATE INDEX "idx_monthly_period_user_month" ON "MonthlyPeriod"(user_id, month)`.execute(db);
  await sql`CREATE INDEX "idx_monthly_period_status" ON "MonthlyPeriod"(status)`.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`DROP TABLE IF EXISTS "MonthlyPeriod"`.execute(db);
}
