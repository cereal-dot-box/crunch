import * as repo from './repository';
import type {
  SplitwiseSettingRow,
  CreateSplitwiseSettingParams,
  UpdateSplitwiseSettingParams,
} from './types';

export class SplitwiseSetting {
  constructor(private data: SplitwiseSettingRow) {}

  get id() { return this.data.id; }
  get userId() { return this.data.user_id; }
  get createdAt() { return this.data.created_at; }
  get updatedAt() { return this.data.updated_at; }

  /**
   * Get parsed included group IDs as an array of numbers
   */
  getIncludedGroupIds(): number[] {
    return repo.parseIncludedGroupIds(this.data);
  }

  /**
   * Check if auto-sync is enabled
   */
  isAutoSyncEnabled(): boolean {
    return this.data.auto_sync_enabled === 1;
  }

  toJSON(): Omit<SplitwiseSettingRow, 'included_group_ids' | 'auto_sync_enabled'> & {
    included_group_ids: number[];
    auto_sync_enabled: boolean;
  } {
    return {
      id: this.data.id,
      user_id: this.data.user_id,
      included_group_ids: this.getIncludedGroupIds(),
      auto_sync_enabled: this.isAutoSyncEnabled(),
      created_at: this.data.created_at,
      updated_at: this.data.updated_at,
    };
  }

  static getByUserId: (userId: string) => Promise<SplitwiseSetting | null>;
  static getById: (id: number, userId: string) => Promise<SplitwiseSetting | null>;
  static create: (params: CreateSplitwiseSettingParams) => Promise<SplitwiseSetting>;
  static update: (userId: string, params: UpdateSplitwiseSettingParams) => Promise<SplitwiseSetting | null>;
  static upsert: (userId: string, params: UpdateSplitwiseSettingParams) => Promise<SplitwiseSetting>;
  static delete: (userId: string) => Promise<void>;
  static getOrCreateDefault: (userId: string) => Promise<SplitwiseSetting>;
}

// Static factory methods
SplitwiseSetting.getByUserId = async (userId: string): Promise<SplitwiseSetting | null> => {
  const row = await repo.getSplitwiseSettingByUserId(userId);
  return row ? new SplitwiseSetting(row) : null;
};

SplitwiseSetting.getById = async (id: number, userId: string): Promise<SplitwiseSetting | null> => {
  const row = await repo.getSplitwiseSettingById(id, userId);
  return row ? new SplitwiseSetting(row) : null;
};

SplitwiseSetting.create = async (params: CreateSplitwiseSettingParams): Promise<SplitwiseSetting> => {
  const row = await repo.createSplitwiseSetting(params);
  return new SplitwiseSetting(row);
};

SplitwiseSetting.update = async (userId: string, params: UpdateSplitwiseSettingParams): Promise<SplitwiseSetting | null> => {
  const row = await repo.updateSplitwiseSetting(userId, params);
  return row ? new SplitwiseSetting(row) : null;
};

SplitwiseSetting.upsert = async (userId: string, params: UpdateSplitwiseSettingParams): Promise<SplitwiseSetting> => {
  const row = await repo.upsertSplitwiseSetting(userId, params);
  return new SplitwiseSetting(row);
};

SplitwiseSetting.delete = async (userId: string): Promise<void> => {
  await repo.deleteSplitwiseSetting(userId);
};

/**
 * Get existing settings or create default settings for the user
 * This is the main method that should be used for getting settings
 */
SplitwiseSetting.getOrCreateDefault = async (userId: string): Promise<SplitwiseSetting> => {
  const existing = await SplitwiseSetting.getByUserId(userId);
  if (existing) {
    return existing;
  }

  // Create default settings
  return await SplitwiseSetting.create({
    userId,
    includedGroupIds: [],
    autoSyncEnabled: false,
  });
};

export type { SplitwiseSettingRow, CreateSplitwiseSettingParams, UpdateSplitwiseSettingParams };
