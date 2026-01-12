import { db } from '../../lib/database';
import type { BalanceUpdateRow, CreateBalanceUpdateParams } from './types';

export async function createBalanceUpdate(params: CreateBalanceUpdateParams): Promise<BalanceUpdateRow> {
  return await db
    .insertInto('BalanceUpdate')
    .values({
      user_id: params.userId,
      account_id: params.accountId,
      processed_email_id: params.processedEmailId ?? null,
      sync_source_id: params.syncSourceId ?? null,
      balance_type: params.balanceType,
      new_balance: params.newBalance,
      update_source: params.updateSource,
      source_detail: params.sourceDetail ?? null,
      update_date: params.updateDate,
    })
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function getBalanceUpdatesByAccountId(
  accountId: number,
  userId: string,
  limit: number = 50,
  offset: number = 0
): Promise<BalanceUpdateRow[]> {
  return await db
    .selectFrom('BalanceUpdate')
    .selectAll()
    .where('account_id', '=', accountId)
    .where('user_id', '=', userId)
    .orderBy('update_date', 'desc')
    .orderBy('id', 'desc')
    .limit(limit)
    .offset(offset)
    .execute();
}

export async function getBalanceUpdatesByUserId(
  userId: string,
  limit: number = 50,
  offset: number = 0
): Promise<BalanceUpdateRow[]> {
  return await db
    .selectFrom('BalanceUpdate')
    .selectAll()
    .where('user_id', '=', userId)
    .orderBy('update_date', 'desc')
    .orderBy('id', 'desc')
    .limit(limit)
    .offset(offset)
    .execute();
}

export async function getLatestBalanceForAccount(
  accountId: number,
  userId: string,
  balanceType: 'available_balance' | 'current_balance'
): Promise<BalanceUpdateRow | undefined> {
  return await db
    .selectFrom('BalanceUpdate')
    .selectAll()
    .where('account_id', '=', accountId)
    .where('user_id', '=', userId)
    .where('balance_type', '=', balanceType)
    .orderBy('update_date', 'desc')
    .orderBy('id', 'desc')
    .limit(1)
    .executeTakeFirst();
}

/**
 * Get the current balance for an account
 * Returns the most recent balance update, or null if no updates exist
 */
export async function getCurrentBalance(
  accountId: number,
  userId: string,
  balanceType: 'available_balance' | 'current_balance' = 'available_balance'
): Promise<number | null> {
  const latest = await getLatestBalanceForAccount(accountId, userId, balanceType);
  return latest?.new_balance ?? null;
}

export async function deleteBalanceUpdatesByAccountId(accountId: number, userId: string) {
  return await db
    .deleteFrom('BalanceUpdate')
    .where('account_id', '=', accountId)
    .where('user_id', '=', userId)
    .execute();
}
