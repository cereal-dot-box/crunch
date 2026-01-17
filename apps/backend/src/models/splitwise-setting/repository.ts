import { db } from '../../lib/database';
import type { SplitwiseSettingRow, CreateSplitwiseSettingParams, UpdateSplitwiseSettingParams } from './types';

/**
 * Create a new Splitwise setting for a user
 */
export async function createSplitwiseSetting(params: CreateSplitwiseSettingParams): Promise<SplitwiseSettingRow> {
  return await db
    .insertInto('SplitwiseSetting')
    .values({
      user_id: params.userId,
      included_group_ids: JSON.stringify(params.includedGroupIds ?? []),
      auto_sync_enabled: params.autoSyncEnabled ? 1 : 0,
    })
    .returningAll()
    .executeTakeFirstOrThrow();
}

/**
 * Get Splitwise setting by user ID
 */
export async function getSplitwiseSettingByUserId(userId: string): Promise<SplitwiseSettingRow | undefined> {
  return await db
    .selectFrom('SplitwiseSetting')
    .selectAll()
    .where('user_id', '=', userId)
    .executeTakeFirst();
}

/**
 * Get Splitwise setting by ID with user verification
 */
export async function getSplitwiseSettingById(id: number, userId: string): Promise<SplitwiseSettingRow | undefined> {
  return await db
    .selectFrom('SplitwiseSetting')
    .selectAll()
    .where('id', '=', id)
    .where('user_id', '=', userId)
    .executeTakeFirst();
}

/**
 * Update Splitwise setting
 * Also updates the updated_at timestamp
 */
export async function updateSplitwiseSetting(
  userId: string,
  params: UpdateSplitwiseSettingParams
): Promise<SplitwiseSettingRow | undefined> {
  const updates: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (params.includedGroupIds !== undefined) {
    updates.included_group_ids = JSON.stringify(params.includedGroupIds);
  }
  if (params.autoSyncEnabled !== undefined) {
    updates.auto_sync_enabled = params.autoSyncEnabled ? 1 : 0;
  }

  const result = await db
    .updateTable('SplitwiseSetting')
    .set(updates)
    .where('user_id', '=', userId)
    .returningAll()
    .executeTakeFirst();

  return result ?? undefined;
}

/**
 * Upsert Splitwise setting
 * Creates a default setting if it doesn't exist, otherwise updates it
 */
export async function upsertSplitwiseSetting(
  userId: string,
  params: UpdateSplitwiseSettingParams
): Promise<SplitwiseSettingRow> {
  const existing = await getSplitwiseSettingByUserId(userId);

  if (existing) {
    const updated = await updateSplitwiseSetting(userId, params);
    if (updated) {
      return updated;
    }
  }

  // Create new setting with defaults
  return await createSplitwiseSetting({
    userId,
    includedGroupIds: params.includedGroupIds ?? [],
    autoSyncEnabled: params.autoSyncEnabled ?? false,
  });
}

/**
 * Delete Splitwise setting for a user
 */
export async function deleteSplitwiseSetting(userId: string): Promise<void> {
  await db
    .deleteFrom('SplitwiseSetting')
    .where('user_id', '=', userId)
    .execute();
}

/**
 * Helper: Parse JSON string to number array
 */
export function parseIncludedGroupIds(setting: SplitwiseSettingRow): number[] {
  try {
    return JSON.parse(setting.included_group_ids) as number[];
  } catch {
    return [];
  }
}
