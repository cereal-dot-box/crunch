export interface User {
  userId: number;
}

export interface Account {
  id: number;
  name: string;
  bank: string | null;
  type: string | null;
  mask: string | null;
  current_balance: number | null;
  available_balance: number | null;
  iso_currency_code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SyncSource {
  id: number;
  account_id: number;
  name: string;
  email_address: string;
  imap_host: string;
  imap_port: number;
  imap_folder: string;
  status: string;
  last_synced_at: string | null;
  last_processed_uid: string | null;
  is_active: boolean;
  created_at: string;
  balance_count: number;
  transaction_count: number;
}

export interface Category {
  id: number;
  name: string;
  plaid_category_id: string | null;
  parent_category: string | null;
  is_custom: boolean;
  color: string | null;
  icon: string | null;
  created_at: string;
}

export interface Transaction {
  id: number;
  transaction_id: string;
  account_id: number;
  category_id: number | null;
  amount: number;
  iso_currency_code: string;
  date: string;
  authorized_date: string | null;
  name: string;
  merchant_name: string | null;
  pending: boolean;
  payment_channel: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface TransactionStats {
  totalSpent: number;
  byCategory: {
    category_id: number | null;
    category_name: string | null;
    total: number;
  }[];
}

export interface TestConnectionResult {
  success: boolean;
  error_message: string | null;
}

export interface SyncResult {
  timestamp: string;
  emails_fetched: number;
  jobs_enqueued: number;
  errors: number;
  duration: number;
}

export interface AvailableBankType {
  bank: string;
  types: string[];
}

export interface MonthlyPeriod {
  id: number;
  user_id: number;
  month: string;
  projected_income: number;
  actual_income: number;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  is_open: boolean;
  is_closed: boolean;
}

export interface CreateMonthlyPeriodInput {
  month: string;
  projected_income: number;
  notes?: string;
}

export interface UpdateMonthlyPeriodInput {
  projected_income?: number;
  actual_income?: number;
  status?: string;
  notes?: string;
}
