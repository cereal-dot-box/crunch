import { db } from '../../lib/database';
import type { AccountRow, CreateAccountParams, UpdateAccountParams } from './types';

export async function createAccount(params: CreateAccountParams): Promise<AccountRow> {
  return await db
    .insertInto('Account')
    .values({
      user_id: params.userId,
      name: params.name,
      bank: params.bank,
      type: params.type,
      mask: params.mask,
      iso_currency_code: params.isoCurrencyCode,
      is_active: 1,
    })
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function getAccountsByUserId(userId: string): Promise<AccountRow[]> {
  return await db
    .selectFrom('Account')
    .selectAll()
    .where('user_id', '=', userId)
    .where('is_active', '=', 1)
    .execute();
}

export async function getAccountById(accountId: number, userId: string): Promise<AccountRow | undefined> {
  return await db
    .selectFrom('Account')
    .selectAll()
    .where('id', '=', accountId)
    .where('user_id', '=', userId)
    .executeTakeFirst();
}

export async function deactivateAccount(accountId: number, userId: string): Promise<void> {
  // Import here to avoid circular dependency
  const { Transaction } = await import('../transaction');
  const { BalanceUpdate } = await import('../balance-update');

  // Delete all transactions for this account first
  await Transaction.deleteByAccountId(accountId, userId);

  // Delete all balance updates for this account
  await BalanceUpdate.deleteByAccountId(accountId, userId);

  // Then deactivate the account
  await db
    .updateTable('Account')
    .set({ is_active: 0, updated_at: new Date().toISOString() })
    .where('id', '=', accountId)
    .where('user_id', '=', userId)
    .execute();
}

export async function updateAccount(accountId: number, userId: string, updates: UpdateAccountParams) {
  return await db
    .updateTable('Account')
    .set({ ...updates, updated_at: new Date().toISOString() })
    .where('id', '=', accountId)
    .where('user_id', '=', userId)
    .execute();
}
