import { db } from '../../lib/database';
import { encrypt } from '../../lib/encryption';
import type { SyncSourceRow, CreateSyncSourceParams, UpdateSyncSourceParams } from './types';

export async function createSyncSource(params: CreateSyncSourceParams) {
  const encryptedPassword = encrypt(params.imapPasswordEncrypted);

  return await db
    .insertInto('SyncSource')
    .values({
      account_id: params.accountId,
      name: params.name,
      type: params.type,
      bank: params.bank,
      account_type: params.accountType,
      email_address: params.emailAddress,
      imap_host: params.imapHost,
      imap_port: params.imapPort,
      imap_password_encrypted: encryptedPassword,
      imap_folder: params.imapFolder ?? 'INBOX',
      status: 'active',
      is_active: 1,
    })
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function getSyncSourcesByUserId(userId: number): Promise<SyncSourceRow[]> {
  return await db
    .selectFrom('SyncSource')
    .innerJoin('Account', 'Account.id', 'SyncSource.account_id')
    .selectAll('SyncSource')
    .where('Account.user_id', '=', userId)
    .where('SyncSource.is_active', '=', 1)
    .execute();
}

export async function getSyncSourcesByAccountId(accountId: number): Promise<SyncSourceRow[]> {
  return await db
    .selectFrom('SyncSource')
    .selectAll()
    .where('account_id', '=', accountId)
    .where('is_active', '=', 1)
    .execute();
}

export async function getSyncSourceById(id: number, userId: number): Promise<SyncSourceRow | undefined> {
  return await db
    .selectFrom('SyncSource')
    .innerJoin('Account', 'Account.id', 'SyncSource.account_id')
    .selectAll('SyncSource')
    .where('SyncSource.id', '=', id)
    .where('Account.user_id', '=', userId)
    .executeTakeFirst();
}

export async function getSyncSource(id: number): Promise<SyncSourceRow | undefined> {
  return await db
    .selectFrom('SyncSource')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst();
}

export async function updateSyncSourceStatus(
  id: number,
  status: 'active' | 'error'
) {
  return await db
    .updateTable('SyncSource')
    .set({ status })
    .where('id', '=', id)
    .execute();
}

export async function updateSyncSourceLastSynced(
  syncSourceId: number,
  lastProcessedUid?: string
) {
  return await db
    .updateTable('SyncSource')
    .set({
      last_synced_at: new Date().toISOString(),
      ...(lastProcessedUid !== undefined && { last_processed_uid: lastProcessedUid }),
    })
    .where('id', '=', syncSourceId)
    .execute();
}

export async function getActiveSyncSources(userId: number): Promise<SyncSourceRow[]> {
  return await db
    .selectFrom('SyncSource')
    .innerJoin('Account', 'Account.id', 'SyncSource.account_id')
    .selectAll('SyncSource')
    .where('Account.user_id', '=', userId)
    .where('SyncSource.is_active', '=', 1)
    .where('SyncSource.status', '=', 'active')
    .execute();
}

export async function deleteSyncSource(id: number, userId: number) {
  return await db
    .deleteFrom('SyncSource')
    .using('Account')
    .where('SyncSource.id', '=', id)
    .where('Account.user_id', '=', userId)
    .execute();
}

export async function updateSyncSource(
  id: number,
  userId: number,
  params: UpdateSyncSourceParams
): Promise<SyncSourceRow | undefined> {
  // First verify the sync source exists and belongs to the user
  const existing = await getSyncSourceById(id, userId);
  if (!existing) {
    return undefined;
  }

  const updates: Record<string, any> = {};

  if (params.name !== undefined) updates.name = params.name;
  if (params.type !== undefined) updates.type = params.type;
  if (params.emailAddress !== undefined) updates.email_address = params.emailAddress;
  if (params.imapHost !== undefined) updates.imap_host = params.imapHost;
  if (params.imapPort !== undefined) updates.imap_port = params.imapPort;
  if (params.imapFolder !== undefined) updates.imap_folder = params.imapFolder;
  if (params.imapPassword !== undefined) {
    updates.imap_password_encrypted = encrypt(params.imapPassword);
  }

  if (Object.keys(updates).length === 0) {
    return existing;
  }

  await db
    .updateTable('SyncSource')
    .set(updates)
    .where('id', '=', id)
    .execute();

  return await getSyncSourceById(id, userId);
}

export async function getSyncSourceWithStats(syncSourceId: number) {
  const source = await getSyncSource(syncSourceId);
  if (!source) return null;

  // Count balance updates from general BalanceUpdate table
  const balanceCount = await db
    .selectFrom('BalanceUpdate')
    .select(({ fn }) => [fn.count('id').as('count')])
    .where('sync_source_id', '=', syncSourceId)
    .executeTakeFirst();

  // Count transactions from general Transaction table
  const transactionCount = await db
    .selectFrom('Transaction')
    .select(({ fn }) => [fn.count('id').as('count')])
    .where('sync_source_id', '=', syncSourceId)
    .executeTakeFirst();

  return {
    ...source,
    balance_count: Number(balanceCount?.count ?? 0),
    transaction_count: Number(transactionCount?.count ?? 0),
  };
}
