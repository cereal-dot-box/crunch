import * as repo from './repository';
import type { AccountRow, CreateAccountParams, UpdateAccountParams } from './types';

export class Account {
  constructor(private data: AccountRow) {}

  get id() { return this.data.id; }
  get userId() { return this.data.user_id; }
  get name() { return this.data.name; }
  get bank() { return this.data.bank; }
  get type() { return this.data.type; }
  get mask() { return this.data.mask; }
  get isoCurrencyCode() { return this.data.iso_currency_code; }
  get isActive() { return this.data.is_active === 1; }
  get createdAt() { return this.data.created_at; }
  get updatedAt() { return this.data.updated_at; }

  toJSON(): AccountRow {
    return { ...this.data };
  }

  static getByUserId: (userId: string) => Promise<Account[]>;
  static getById: (accountId: number, userId: string) => Promise<Account | null>;
  static create: (params: CreateAccountParams) => Promise<AccountRow>;
  static deactivate: (accountId: number, userId: string) => Promise<void>;
  static update: (accountId: number, userId: string, updates: UpdateAccountParams) => Promise<void>;
}

// Static factory methods
Account.getByUserId = async (userId: string): Promise<Account[]> => {
  const rows = await repo.getAccountsByUserId(userId);
  return rows.map(row => new Account(row));
};

Account.getById = async (accountId: number, userId: string): Promise<Account | null> => {
  const row = await repo.getAccountById(accountId, userId);
  return row ? new Account(row) : null;
};

Account.create = async (params: CreateAccountParams): Promise<AccountRow> => {
  return await repo.createAccount(params);
};

Account.deactivate = async (accountId: number, userId: string): Promise<void> => {
  await repo.deactivateAccount(accountId, userId);
};

Account.update = async (accountId: number, userId: string, updates: UpdateAccountParams): Promise<void> => {
  await repo.updateAccount(accountId, userId, updates);
};

export type { AccountRow, CreateAccountParams, UpdateAccountParams };
