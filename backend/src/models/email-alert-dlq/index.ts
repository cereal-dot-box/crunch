import * as repo from './repository';
import type { EmailAlertDLQRow, CreateDLQEntryParams, DLQErrorType } from './types';

export class EmailAlertDLQ {
  constructor(private data: EmailAlertDLQRow) {}

  get id() { return this.data.id; }
  get userId() { return this.data.user_id; }
  get syncSourceId() { return this.data.sync_source_id; }
  get messageUid() { return this.data.message_uid; }
  get subject() { return this.data.subject; }
  get fromAddress() { return this.data.from_address; }
  get date() { return this.data.date; }
  get bodyText() { return this.data.body_text; }
  get bodyHtml() { return this.data.body_html; }
  get errorMessage() { return this.data.error_message; }
  get errorType() { return this.data.error_type; }
  get errorStack() { return this.data.error_stack; }
  get createdAt() { return this.data.created_at; }

  toJSON(): EmailAlertDLQRow {
    return { ...this.data };
  }

  static getById: (id: number, userId: number) => Promise<EmailAlertDLQ | null>;
  static getByMessageUid: (messageUid: string, userId: number) => Promise<EmailAlertDLQ | null>;
  static getAll: (userId: number, limit?: number, offset?: number) => Promise<EmailAlertDLQ[]>;
  static getMessageUids: (userId: number) => Promise<string[]>;
  static create: (params: CreateDLQEntryParams) => Promise<EmailAlertDLQRow>;
  static delete: (id: number, userId: number) => Promise<void>;
}

// Static factory methods
EmailAlertDLQ.getById = async (id: number, userId: number): Promise<EmailAlertDLQ | null> => {
  const row = await repo.getDLQById(id, userId);
  return row ? new EmailAlertDLQ(row) : null;
};

EmailAlertDLQ.getByMessageUid = async (
  messageUid: string,
  userId: number
): Promise<EmailAlertDLQ | null> => {
  const row = await repo.getDLQByMessageUid(messageUid, userId);
  return row ? new EmailAlertDLQ(row) : null;
};

EmailAlertDLQ.getAll = async (
  userId: number,
  limit?: number,
  offset?: number
): Promise<EmailAlertDLQ[]> => {
  const rows = await repo.getAllDLQItems(userId, limit, offset);
  return rows.map(row => new EmailAlertDLQ(row));
};

EmailAlertDLQ.getMessageUids = async (userId: number): Promise<string[]> => {
  return await repo.getDLQMessageUids(userId);
};

EmailAlertDLQ.create = async (params: CreateDLQEntryParams): Promise<EmailAlertDLQRow> => {
  return await repo.createDLQEntry(params);
};

EmailAlertDLQ.delete = async (id: number, userId: number): Promise<void> => {
  await repo.deleteDLQ(id, userId);
};

export type { EmailAlertDLQRow, CreateDLQEntryParams, DLQErrorType };
