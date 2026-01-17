export interface TransactionRow {
  id: number;
  user_id: number;
  account_id: number;
  processed_email_id: number | null;
  sync_source_id: number | null;
  amount: number;
  iso_currency_code: string;
  transaction_date: string;
  authorized_date: string | null;
  name: string;
  merchant_name: string | null;
  pending: number;
  payment_channel: string | null;
  category: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTransactionParams {
  userId: number;
  accountId: number;
  syncSourceId?: number | null;
  processedEmailId?: number | null;
  amount: number;
  isoCurrencyCode?: string;
  transactionDate: string;
  authorizedDate?: string | null;
  name: string;
  merchantName?: string | null;
  pending?: number;
  paymentChannel?: string | null;
  category?: string | null;
}
