import * as repo from './repository';
import type { TransactionRow, CreateTransactionParams } from './types';

export class Transaction {
  constructor(private data: TransactionRow) {}

  get id() { return this.data.id; }
  get userId() { return this.data.user_id; }
  get accountId() { return this.data.account_id; }
  get processedEmailId() { return this.data.processed_email_id; }
  get syncSourceId() { return this.data.sync_source_id; }
  get amount() { return this.data.amount; }
  get isoCurrencyCode() { return this.data.iso_currency_code; }
  get transactionDate() { return this.data.transaction_date; }
  get authorizedDate() { return this.data.authorized_date; }
  get name() { return this.data.name; }
  get merchantName() { return this.data.merchant_name; }
  get pending() { return this.data.pending === 1; }
  get paymentChannel() { return this.data.payment_channel; }
  get category() { return this.data.category; }
  get createdAt() { return this.data.created_at; }
  get updatedAt() { return this.data.updated_at; }

  toJSON() {
    return {
      id: this.data.id,
      transaction_id: String(this.data.id),
      account_id: this.data.account_id,
      amount: this.data.amount,
      iso_currency_code: this.data.iso_currency_code,
      date: this.data.transaction_date,
      authorized_date: this.data.authorized_date,
      name: this.data.name,
      merchant_name: this.data.merchant_name,
      pending: this.data.pending === 1,
      payment_channel: this.data.payment_channel,
      created_at: this.data.created_at,
      updated_at: this.data.updated_at,
    };
  }

  static getByAccountId: (accountId: number, userId: number, limit?: number, offset?: number) => Promise<Transaction[]>;
  static getByUserId: (userId: number, limit?: number, offset?: number) => Promise<Transaction[]>;
  static getBySyncSourceId: (syncSourceId: number, limit?: number, offset?: number) => Promise<Transaction[]>;
  static getById: (id: number, userId: number) => Promise<Transaction | null>;
  static create: (params: CreateTransactionParams) => Promise<TransactionRow>;
  static deleteByAccountId: (accountId: number, userId: number) => Promise<void>;
  static getCountByAccountId: (accountId: number, userId: number) => Promise<number>;
  static getCountByUserId: (userId: number) => Promise<number>;
}

// Static factory methods
Transaction.getByAccountId = async (
  accountId: number,
  userId: number,
  limit?: number,
  offset?: number
): Promise<Transaction[]> => {
  const rows = await repo.getTransactionsByAccountId(accountId, userId, limit, offset);
  return rows.map(row => new Transaction(row));
};

Transaction.getByUserId = async (
  userId: number,
  limit?: number,
  offset?: number
): Promise<Transaction[]> => {
  const rows = await repo.getTransactionsByUserId(userId, limit, offset);
  return rows.map(row => new Transaction(row));
};

Transaction.getBySyncSourceId = async (
  syncSourceId: number,
  limit?: number,
  offset?: number
): Promise<Transaction[]> => {
  const rows = await repo.getTransactionsBySyncSourceId(syncSourceId, limit, offset);
  return rows.map(row => new Transaction(row));
};

Transaction.getById = async (
  id: number,
  userId: number
): Promise<Transaction | null> => {
  const row = await repo.getTransactionById(id, userId);
  return row ? new Transaction(row) : null;
};

Transaction.create = async (params: CreateTransactionParams): Promise<TransactionRow> => {
  return await repo.createTransaction(params);
};

Transaction.deleteByAccountId = async (accountId: number, userId: number): Promise<void> => {
  await repo.deleteTransactionsByAccountId(accountId, userId);
};

Transaction.getCountByAccountId = async (accountId: number, userId: number): Promise<number> => {
  return await repo.getTransactionsCountByAccountId(accountId, userId);
};

Transaction.getCountByUserId = async (userId: number): Promise<number> => {
  return await repo.getTransactionsCountByUserId(userId);
};

export type { TransactionRow, CreateTransactionParams };
