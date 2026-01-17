import * as repo from './repository';
import type { BalanceUpdateRow, CreateBalanceUpdateParams } from './types';

export class BalanceUpdate {
  constructor(private data: BalanceUpdateRow) {}

  get id() { return this.data.id; }
  get userId() { return this.data.user_id; }
  get accountId() { return this.data.account_id; }
  get processedEmailId() { return this.data.processed_email_id; }
  get syncSourceId() { return this.data.sync_source_id; }
  get balanceType() { return this.data.balance_type; }
  get newBalance() { return this.data.new_balance; }
  get updateSource() { return this.data.update_source; }
  get sourceDetail() { return this.data.source_detail; }
  get updateDate() { return this.data.update_date; }
  get createdAt() { return this.data.created_at; }

  toJSON(): BalanceUpdateRow {
    return { ...this.data };
  }

  static getByAccountId: (accountId: number, userId: string, limit?: number, offset?: number) => Promise<BalanceUpdate[]>;
  static getByUserId: (userId: string, limit?: number, offset?: number) => Promise<BalanceUpdate[]>;
  static getLatestForAccount: (accountId: number, userId: string, balanceType: 'available_balance' | 'current_balance') => Promise<BalanceUpdate | null>;
  static getCurrent: (accountId: number, userId: string, balanceType?: 'available_balance' | 'current_balance') => Promise<number | null>;
  static create: (params: CreateBalanceUpdateParams) => Promise<BalanceUpdateRow>;
  static deleteByAccountId: (accountId: number, userId: string) => Promise<void>;
}

// Static factory methods
BalanceUpdate.getByAccountId = async (
  accountId: number,
  userId: string,
  limit?: number,
  offset?: number
): Promise<BalanceUpdate[]> => {
  const rows = await repo.getBalanceUpdatesByAccountId(accountId, userId, limit, offset);
  return rows.map(row => new BalanceUpdate(row));
};

BalanceUpdate.getByUserId = async (
  userId: string,
  limit?: number,
  offset?: number
): Promise<BalanceUpdate[]> => {
  const rows = await repo.getBalanceUpdatesByUserId(userId, limit, offset);
  return rows.map(row => new BalanceUpdate(row));
};

BalanceUpdate.getLatestForAccount = async (
  accountId: number,
  userId: string,
  balanceType: 'available_balance' | 'current_balance'
): Promise<BalanceUpdate | null> => {
  const row = await repo.getLatestBalanceForAccount(accountId, userId, balanceType);
  return row ? new BalanceUpdate(row) : null;
};

BalanceUpdate.getCurrent = async (
  accountId: number,
  userId: string,
  balanceType?: 'available_balance' | 'current_balance'
): Promise<number | null> => {
  return await repo.getCurrentBalance(accountId, userId, balanceType);
};

BalanceUpdate.create = async (params: CreateBalanceUpdateParams): Promise<BalanceUpdateRow> => {
  return await repo.createBalanceUpdate(params);
};

BalanceUpdate.deleteByAccountId = async (accountId: number, userId: string): Promise<void> => {
  await repo.deleteBalanceUpdatesByAccountId(accountId, userId);
};

export type { BalanceUpdateRow, CreateBalanceUpdateParams };
