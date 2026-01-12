import * as repo from './repository';
import type { SyncSourceRow, SyncSourceWithStats, CreateSyncSourceParams, UpdateSyncSourceParams } from './types';

export class SyncSource {
  constructor(private data: SyncSourceRow) {}

  get id() { return this.data.id; }
  get name() { return this.data.name; }
  get type() { return this.data.type; }
  get bank() { return this.data.bank; }
  get accountType() { return this.data.account_type; }
  get accountId() { return this.data.account_id; }
  get emailAddress() { return this.data.email_address; }
  get imapHost() { return this.data.imap_host; }
  get imapPort() { return this.data.imap_port; }
  get imapFolder() { return this.data.imap_folder; }
  get status() { return this.data.status; }
  get lastSyncedAt() { return this.data.last_synced_at; }
  get isActive() { return this.data.is_active === 1; }

  toJSON(): SyncSourceRow {
    return { ...this.data };
  }

  static getByAccountId: (accountId: number) => Promise<SyncSource[]>;
  static getByUserId: (userId: string) => Promise<SyncSource[]>;
  static getActiveByUserId: (userId: string) => Promise<SyncSource[]>;
  static getById: (id: number, userId: string) => Promise<SyncSource | null>;
  static create: (params: CreateSyncSourceParams) => Promise<SyncSourceRow>;
  static delete: (id: number, userId: string) => Promise<void>;
  static updateStatus: (id: number, status: 'active' | 'error') => Promise<void>;
  static updateLastSynced: (syncSourceId: number, lastProcessedUid?: string) => Promise<void>;
  static getWithStats: (syncSourceId: number) => Promise<SyncSourceWithStats | null>;
  static update: (id: number, userId: string, params: UpdateSyncSourceParams) => Promise<SyncSource | null>;
}

// Static factory methods
SyncSource.getByAccountId = async (accountId: number): Promise<SyncSource[]> => {
  const rows = await repo.getSyncSourcesByAccountId(accountId);
  return rows.map(row => new SyncSource(row));
};

SyncSource.getByUserId = async (userId: string): Promise<SyncSource[]> => {
  const rows = await repo.getSyncSourcesByUserId(userId);
  return rows.map(row => new SyncSource(row));
};

SyncSource.getActiveByUserId = async (userId: string): Promise<SyncSource[]> => {
  const rows = await repo.getActiveSyncSources(userId);
  return rows.map(row => new SyncSource(row));
};

SyncSource.getById = async (id: number, userId: string): Promise<SyncSource | null> => {
  const row = await repo.getSyncSourceById(id, userId);
  return row ? new SyncSource(row) : null;
};

SyncSource.create = async (params: CreateSyncSourceParams): Promise<SyncSourceRow> => {
  return await repo.createSyncSource(params);
};

SyncSource.delete = async (id: number, userId: string): Promise<void> => {
  await repo.deleteSyncSource(id, userId);
};

SyncSource.updateStatus = async (id: number, status: 'active' | 'error'): Promise<void> => {
  await repo.updateSyncSourceStatus(id, status);
};

SyncSource.updateLastSynced = async (syncSourceId: number, lastProcessedUid?: string): Promise<void> => {
  await repo.updateSyncSourceLastSynced(syncSourceId, lastProcessedUid);
};

SyncSource.getWithStats = async (syncSourceId: number): Promise<SyncSourceWithStats | null> => {
  return await repo.getSyncSourceWithStats(syncSourceId);
};

SyncSource.update = async (id: number, userId: string, params: UpdateSyncSourceParams): Promise<SyncSource | null> => {
  const row = await repo.updateSyncSource(id, userId, params);
  return row ? new SyncSource(row) : null;
};

export type { SyncSourceRow, SyncSourceWithStats, CreateSyncSourceParams, UpdateSyncSourceParams };
