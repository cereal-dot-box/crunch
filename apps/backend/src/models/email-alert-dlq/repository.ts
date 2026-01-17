import { db } from '../../lib/database';
import type { EmailAlertDLQRow, CreateDLQEntryParams, DLQErrorType } from './types';

export async function createDLQEntry(params: CreateDLQEntryParams): Promise<EmailAlertDLQRow> {
  const now = new Date().toISOString();

  return await db
    .insertInto('EmailAlertDLQ')
    .values({
      user_id: params.userId,
      sync_source_id: params.syncSourceId,
      message_uid: params.messageUid ?? null,
      subject: params.subject ?? null,
      from_address: params.fromAddress ?? null,
      date: params.date ?? null,
      body_text: params.bodyText ?? null,
      body_html: params.bodyHtml ?? null,
      error_message: params.errorMessage,
      error_type: params.errorType,
      error_stack: params.errorStack ?? null,
      created_at: now,
    })
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function getDLQById(
  id: number,
  userId: string
): Promise<EmailAlertDLQRow | undefined> {
  return await db
    .selectFrom('EmailAlertDLQ')
    .selectAll()
    .where('id', '=', id)
    .where('user_id', '=', userId)
    .executeTakeFirst();
}

export async function getDLQByMessageUid(
  messageUid: string,
  userId: string
): Promise<EmailAlertDLQRow | undefined> {
  return await db
    .selectFrom('EmailAlertDLQ')
    .selectAll()
    .where('message_uid', '=', messageUid)
    .where('user_id', '=', userId)
    .executeTakeFirst();
}

export async function getAllDLQItems(
  userId: string,
  limit?: number,
  offset?: number
): Promise<EmailAlertDLQRow[]> {
  let query = db
    .selectFrom('EmailAlertDLQ')
    .selectAll()
    .where('user_id', '=', userId)
    .orderBy('created_at', 'desc');

  if (limit) {
    query = query.limit(limit);
  }

  if (offset) {
    query = query.offset(offset);
  }

  return await query.execute();
}

export async function deleteDLQ(id: number, userId: string) {
  return await db
    .deleteFrom('EmailAlertDLQ')
    .where('id', '=', id)
    .where('user_id', '=', userId)
    .execute();
}

/**
 * Get all message UIDs that have DLQ entries (for sync to skip)
 */
export async function getDLQMessageUids(userId: string): Promise<string[]> {
  const results = await db
    .selectFrom('EmailAlertDLQ')
    .select('message_uid')
    .where('user_id', '=', userId)
    .execute();

  return results
    .filter((r): r is { message_uid: string } => r.message_uid !== null)
    .map((r) => r.message_uid);
}
