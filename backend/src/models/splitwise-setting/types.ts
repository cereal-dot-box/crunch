export interface SplitwiseSettingRow {
  id: number;
  user_id: string;
  included_group_ids: string; // JSON string array of group IDs
  auto_sync_enabled: number; // 0 or 1 for boolean
  created_at: string;
  updated_at: string;
}

export interface CreateSplitwiseSettingParams {
  userId: string;
  includedGroupIds?: number[]; // Will be JSON stringified by repository
  autoSyncEnabled?: boolean; // Will be converted to 0/1 by repository
}

export interface UpdateSplitwiseSettingParams {
  includedGroupIds?: number[]; // Will be JSON stringified by repository
  autoSyncEnabled?: boolean; // Will be converted to 0/1 by repository
}
