import type { ColumnType } from 'kysely';

export interface Database {
  Session: SessionTable;
  Account: AccountTable;
  BudgetBucket: BudgetBucketTable;
  BalanceUpdate: BalanceUpdateTable;
  Transaction: TransactionTable;
  ProcessedEmails: ProcessedEmailsTable;
  EmailAlertDLQ: EmailAlertDLQTable;
  SyncSource: SyncSourceTable;
  MonthlyPeriod: MonthlyPeriodTable;
}

export interface SessionTable {
  id: string;
  user_id: string;
  data: string | null;
  created_at: ColumnType<string, string | undefined, never>;
  expires_at: string;
  last_activity_at: ColumnType<string, string | undefined, string>;
}

export interface AccountTable {
  id: ColumnType<number, never, never>;
  user_id: string;
  name: string;
  bank: string | null;
  type: string | null;
  mask: string | null;
  iso_currency_code: string;
  is_active: ColumnType<number, number | undefined, number>;
  created_at: ColumnType<string, string | undefined, never>;
  updated_at: ColumnType<string, string | undefined, string>;
}

export interface BudgetBucketTable {
  id: ColumnType<number, never, never>;
  user_id: string;
  bucket_id: string;
  name: string;
  monthly_limit: number;
  color: string;
  is_active: ColumnType<number, number | undefined, number>;
  created_at: ColumnType<string, string | undefined, never>;
  updated_at: ColumnType<string, string | undefined, string>;
}

/**
 * ProcessedEmails - Tracks which emails have been processed
 * Used to avoid reprocessing the same email during sync
 */
export interface ProcessedEmailsTable {
  id: ColumnType<number, never, never>;
  user_id: string;
  sync_source_id: number;
  message_uid: string;
  content_hash: string | null;
  processed_at: ColumnType<string, string | undefined, never>;
}

/**
 * EmailAlertDLQ - Failed email processing log
 * Created when parsing fails after all BullMQ retries. For manual review only.
 */
export interface EmailAlertDLQTable {
  id: ColumnType<number, never, never>;
  user_id: string;
  sync_source_id: number;
  message_uid: string | null;
  subject: string | null;
  from_address: string | null;
  date: string | null;
  body_text: string | null;
  body_html: string | null;
  error_message: string;
  error_type: 'PARSE_ERROR' | 'NO_PARSER' | 'VALIDATION_ERROR' | 'NO_ACCOUNT';
  error_stack: string | null;
  created_at: ColumnType<string, string | undefined, never>;
}

/**
 * BalanceUpdate - Tracks balance changes for accounts
 * Replaces zero-amount transactions for balance tracking
 */
export interface BalanceUpdateTable {
  id: ColumnType<number, never, never>;
  user_id: string;
  account_id: number;
  processed_email_id: number | null;
  sync_source_id: number | null;
  balance_type: 'available_balance' | 'current_balance';
  new_balance: number;
  update_source: string;
  source_detail: string | null;
  update_date: string;
  created_at: ColumnType<string, string | undefined, never>;
}

/**
 * Transaction - General transaction table for all transaction types
 * Consolidates data from bank-specific transaction tables
 */
export interface TransactionTable {
  id: ColumnType<number, never, never>;
  user_id: string;
  account_id: number;
  processed_email_id: number | null;
  sync_source_id: number | null;
  amount: number;
  iso_currency_code: string;
  transaction_date: string;
  authorized_date: string | null;
  name: string;
  merchant_name: string | null;
  pending: ColumnType<number, number | undefined, number>;
  payment_channel: string | null;
  category: string | null;
  created_at: ColumnType<string, string | undefined, never>;
  updated_at: ColumnType<string, string | undefined, string>;
}

/**
 * SyncSource - Links accounts to their data providers (email, API, etc.)
 * Replaces the old EmailProvider table with account-centric design
 * Each account can have multiple sync sources for different data types (balance, transactions)
 */
export interface SyncSourceTable {
  id: ColumnType<number, never, never>;
  account_id: number;
  name: string; // e.g., 'bmo cc balance', 'bmo cc transactions'
  type: string; // 'balance', 'transactions'
  bank: string | null;
  account_type: string | null;
  email_address: string;
  imap_host: string;
  imap_port: number;
  imap_password_encrypted: string;
  imap_folder: string;
  last_processed_uid: string | null;
  status: string; // 'active', 'error'
  last_synced_at: string | null;
  is_active: ColumnType<number, number | undefined, number>;
  created_at: ColumnType<string, string | undefined, never>;
}

/**
 * MonthlyPeriod - Tracks monthly income projections and actuals
 * Used for monthly savings tracking and budget planning
 */
export interface MonthlyPeriodTable {
  id: ColumnType<number, never, never>;
  user_id: string;
  month: string; // YYYY-MM format
  projected_income: number; // What you expected
  actual_income: number; // What actually happened
  status: string; // 'open' | 'closed'
  notes: string | null;
  created_at: ColumnType<string, string | undefined, never>;
  updated_at: ColumnType<string, string | undefined, string>;
}