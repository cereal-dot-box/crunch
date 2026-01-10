import { db } from '../../lib/database';
import type { ProcessedEmailsRow, MarkEmailProcessedParams } from './types';

/**
 * Check if an email has already been processed
 */
export async function isEmailProcessed(
  syncSourceId: number,
  messageUid: string
): Promise<boolean> {
  const result = await db
    .selectFrom('ProcessedEmails')
    .select('id')
    .where('sync_source_id', '=', syncSourceId)
    .where('message_uid', '=', messageUid)
    .executeTakeFirst();

  return !!result;
}

/**
 * Mark an email as processed
 * If already marked, returns the existing record
 */
export async function markEmailProcessed(params: MarkEmailProcessedParams): Promise<ProcessedEmailsRow> {
  // Check if already exists first
  const existing = await db
    .selectFrom('ProcessedEmails')
    .selectAll()
    .where('sync_source_id', '=', params.syncSourceId)
    .where('message_uid', '=', params.messageUid)
    .executeTakeFirst();

  if (existing) {
    return existing;
  }

  const result = await db
    .insertInto('ProcessedEmails')
    .values({
      user_id: params.userId,
      sync_source_id: params.syncSourceId,
      message_uid: params.messageUid,
      content_hash: params.contentHash ?? null,
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  return result;
}

/**
 * Get the count of processed emails for a source
 */
export async function getProcessedEmailsCount(
  syncSourceId: number
): Promise<number> {
  const result = await db
    .selectFrom('ProcessedEmails')
    .select((eb) => eb.fn.count('id').as('count'))
    .where('sync_source_id', '=', syncSourceId)
    .executeTakeFirst();

  return (result?.count as number) ?? 0;
}

/**
 * Get processed emails for a user with pagination
 */
export async function getProcessedEmailsByUserId(
  userId: number,
  limit = 50,
  offset = 0
): Promise<ProcessedEmailsRow[]> {
  return await db
    .selectFrom('ProcessedEmails')
    .selectAll()
    .where('user_id', '=', userId)
    .orderBy('processed_at', 'desc')
    .limit(limit)
    .offset(offset)
    .execute();
}

/**
 * Get processed email by ID
 */
export async function getProcessedEmailById(
  id: number,
  userId: number
): Promise<ProcessedEmailsRow | null> {
  const result = await db
    .selectFrom('ProcessedEmails')
    .selectAll()
    .where('id', '=', id)
    .where('user_id', '=', userId)
    .executeTakeFirst();

  return result ?? null;
}

/**
 * Get all processed message UIDs for a source
 * Useful for checking which emails to skip during sync
 */
export async function getProcessedMessageUids(
  syncSourceId: number
): Promise<string[]> {
  const results = await db
    .selectFrom('ProcessedEmails')
    .select('message_uid')
    .where('sync_source_id', '=', syncSourceId)
    .execute();

  return results.map((r) => r.message_uid);
}
