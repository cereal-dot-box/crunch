import { db } from '../../lib/database';
import type { TransactionRow, CreateTransactionParams } from './types';

export async function createTransaction(params: CreateTransactionParams): Promise<TransactionRow> {
  const now = new Date().toISOString();

  return await db
    .insertInto('Transaction')
    .values({
      user_id: params.userId,
      account_id: params.accountId,
      processed_email_id: params.processedEmailId ?? null,
      sync_source_id: params.syncSourceId ?? null,
      amount: params.amount,
      iso_currency_code: params.isoCurrencyCode ?? 'CAD',
      transaction_date: params.transactionDate,
      authorized_date: params.authorizedDate ?? null,
      name: params.name,
      merchant_name: params.merchantName ?? null,
      pending: params.pending ?? 0,
      payment_channel: params.paymentChannel ?? null,
      category: params.category ?? null,
      created_at: now,
      updated_at: now,
    })
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function getTransactionsByAccountId(
  accountId: number,
  userId: number,
  limit: number = 50,
  offset: number = 0
): Promise<TransactionRow[]> {
  return await db
    .selectFrom('Transaction')
    .selectAll()
    .where('account_id', '=', accountId)
    .where('user_id', '=', userId)
    .orderBy('transaction_date', 'desc')
    .orderBy('id', 'desc')
    .limit(limit)
    .offset(offset)
    .execute();
}

export async function getTransactionsByUserId(
  userId: number,
  limit: number = 50,
  offset: number = 0
): Promise<TransactionRow[]> {
  return await db
    .selectFrom('Transaction')
    .selectAll()
    .where('user_id', '=', userId)
    .orderBy('transaction_date', 'desc')
    .orderBy('id', 'desc')
    .limit(limit)
    .offset(offset)
    .execute();
}

export async function getTransactionsBySyncSourceId(
  syncSourceId: number,
  limit: number = 50,
  offset: number = 0
): Promise<TransactionRow[]> {
  return await db
    .selectFrom('Transaction')
    .selectAll()
    .where('sync_source_id', '=', syncSourceId)
    .orderBy('transaction_date', 'desc')
    .orderBy('id', 'desc')
    .limit(limit)
    .offset(offset)
    .execute();
}

export async function getTransactionById(
  id: number,
  userId: number
): Promise<TransactionRow | undefined> {
  return await db
    .selectFrom('Transaction')
    .selectAll()
    .where('id', '=', id)
    .where('user_id', '=', userId)
    .executeTakeFirst();
}

export async function deleteTransactionsByAccountId(accountId: number, userId: number) {
  return await db
    .deleteFrom('Transaction')
    .where('account_id', '=', accountId)
    .where('user_id', '=', userId)
    .execute();
}

/**
 * Get the total count of transactions for pagination
 */
export async function getTransactionsCountByAccountId(
  accountId: number,
  userId: number
): Promise<number> {
  const result = await db
    .selectFrom('Transaction')
    .select(({ fn }) => [fn.count('id').as('count')])
    .where('account_id', '=', accountId)
    .where('user_id', '=', userId)
    .executeTakeFirst();

  return (result?.count as number) ?? 0;
}

/**
 * Get the total count of transactions for a user
 */
export async function getTransactionsCountByUserId(userId: number): Promise<number> {
  const result = await db
    .selectFrom('Transaction')
    .select(({ fn }) => [fn.count('id').as('count')])
    .where('user_id', '=', userId)
    .executeTakeFirst();

  return (result?.count as number) ?? 0;
}
