export interface BalanceUpdateRow {
  id: number;
  user_id: string;
  account_id: number;
  processed_email_id: number | null;
  sync_source_id: number | null;
  balance_type: 'available_balance' | 'current_balance';
  new_balance: number;
  update_source: string;
  source_detail: string | null;
  update_date: string;
  created_at: string;
}

export interface CreateBalanceUpdateParams {
  userId: string;
  accountId: number;
  processedEmailId?: number | null;
  syncSourceId?: number | null;
  balanceType: 'available_balance' | 'current_balance';
  newBalance: number;
  updateSource: string;
  sourceDetail?: string | null;
  updateDate: string;
}
