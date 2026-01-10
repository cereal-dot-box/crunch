import type { ColumnType } from 'kysely';

export interface SyncSourceRow {
  id: number;
  account_id: number;
  name: string;
  type: string;
  bank: string | null;
  account_type: string | null;
  email_address: string;
  imap_host: string;
  imap_port: number;
  imap_password_encrypted: string;
  imap_folder: string;
  last_processed_uid: string | null;
  status: string;
  last_synced_at: string | null;
  is_active: number | boolean;
  created_at: string;
}

export interface SyncSourceWithStats extends SyncSourceRow {
  balance_count?: number;
  transaction_count?: number;
}

export interface CreateSyncSourceParams {
  accountId: number;
  name: string;
  type: string;
  bank: string;
  accountType: string;
  emailAddress: string;
  imapHost: string;
  imapPort: number;
  imapPasswordEncrypted: string;
  imapFolder?: string;
}

export interface UpdateSyncSourceParams {
  name?: string;
  type?: string;
  emailAddress?: string;
  imapHost?: string;
  imapPort?: number;
  imapPassword?: string;
  imapFolder?: string;
}
