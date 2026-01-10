import * as repo from './repository';
import type { ProcessedEmailsRow, MarkEmailProcessedParams } from './types';

export class ProcessedEmail {
  constructor(private data: ProcessedEmailsRow) {}

  get id() { return this.data.id; }
  get userId() { return this.data.user_id; }
  get syncSourceId() { return this.data.sync_source_id; }
  get messageUid() { return this.data.message_uid; }
  get contentHash() { return this.data.content_hash; }
  get processedAt() { return this.data.processed_at; }

  toJSON(): ProcessedEmailsRow {
    return { ...this.data };
  }

  static isProcessed: (syncSourceId: number, messageUid: string) => Promise<boolean>;
  static mark: (params: { userId: number; syncSourceId: number; messageUid: string; contentHash?: string }) => Promise<ProcessedEmail>;
  static count: (syncSourceId: number) => Promise<number>;
  static getByUserId: (userId: number, limit?: number, offset?: number) => Promise<ProcessedEmail[]>;
  static getById: (id: number, userId: number) => Promise<ProcessedEmail | null>;
  static getMessageUids: (syncSourceId: number) => Promise<string[]>;
}

// Static factory methods
ProcessedEmail.isProcessed = async (
  syncSourceId: number,
  messageUid: string
): Promise<boolean> => {
  return await repo.isEmailProcessed(syncSourceId, messageUid);
};

ProcessedEmail.mark = async (params: MarkEmailProcessedParams): Promise<ProcessedEmail> => {
  const row = await repo.markEmailProcessed(params);
  return new ProcessedEmail(row);
};

ProcessedEmail.count = async (syncSourceId: number): Promise<number> => {
  return await repo.getProcessedEmailsCount(syncSourceId);
};

ProcessedEmail.getByUserId = async (
  userId: number,
  limit?: number,
  offset?: number
): Promise<ProcessedEmail[]> => {
  const rows = await repo.getProcessedEmailsByUserId(userId, limit, offset);
  return rows.map(row => new ProcessedEmail(row));
};

ProcessedEmail.getById = async (id: number, userId: number): Promise<ProcessedEmail | null> => {
  const row = await repo.getProcessedEmailById(id, userId);
  return row ? new ProcessedEmail(row) : null;
};

ProcessedEmail.getMessageUids = async (syncSourceId: number): Promise<string[]> => {
  return await repo.getProcessedMessageUids(syncSourceId);
};

export type { ProcessedEmailsRow, MarkEmailProcessedParams };
