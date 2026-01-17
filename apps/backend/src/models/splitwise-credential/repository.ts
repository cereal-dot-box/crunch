import { db } from '../../lib/database';
import { encrypt, decrypt } from '../../lib/encryption';
import type { SplitwiseCredentialRow, CreateSplitwiseCredentialParams, UpdateSplitwiseCredentialParams } from './types';

/**
 * Create a new Splitwise credential for a user
 * Tokens are encrypted before storage
 */
export async function createSplitwiseCredential(params: CreateSplitwiseCredentialParams): Promise<SplitwiseCredentialRow> {
  const encryptedAccessToken = encrypt(params.accessToken);
  const encryptedRefreshToken = params.refreshToken ? encrypt(params.refreshToken) : null;

  return await db
    .insertInto('SplitwiseCredential')
    .values({
      user_id: params.userId,
      access_token: encryptedAccessToken,
      refresh_token: encryptedRefreshToken,
      token_type: params.tokenType ?? 'Bearer',
      expires_at: params.expiresAt ?? null,
      splitwise_user_id: params.splitwiseUserId,
    })
    .returningAll()
    .executeTakeFirstOrThrow();
}

/**
 * Get Splitwise credential by user ID
 * Returns the credential with encrypted tokens (use decrypt helpers if needed)
 */
export async function getSplitwiseCredentialByUserId(userId: string): Promise<SplitwiseCredentialRow | undefined> {
  return await db
    .selectFrom('SplitwiseCredential')
    .selectAll()
    .where('user_id', '=', userId)
    .executeTakeFirst();
}

/**
 * Get Splitwise credential by ID with user verification
 */
export async function getSplitwiseCredentialById(id: number, userId: string): Promise<SplitwiseCredentialRow | undefined> {
  return await db
    .selectFrom('SplitwiseCredential')
    .selectAll()
    .where('id', '=', id)
    .where('user_id', '=', userId)
    .executeTakeFirst();
}

/**
 * Get Splitwise credential by Splitwise user ID
 */
export async function getSplitwiseCredentialBySplitwiseUserId(splitwiseUserId: string): Promise<SplitwiseCredentialRow | undefined> {
  return await db
    .selectFrom('SplitwiseCredential')
    .selectAll()
    .where('splitwise_user_id', '=', splitwiseUserId)
    .executeTakeFirst();
}

/**
 * Update Splitwise credential
 * Tokens are encrypted before storage
 */
export async function updateSplitwiseCredential(
  userId: string,
  params: UpdateSplitwiseCredentialParams
): Promise<SplitwiseCredentialRow | undefined> {
  const updates: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (params.accessToken !== undefined) {
    updates.access_token = encrypt(params.accessToken);
  }
  if (params.refreshToken !== undefined) {
    updates.refresh_token = params.refreshToken ? encrypt(params.refreshToken) : null;
  }
  if (params.expiresAt !== undefined) {
    updates.expires_at = params.expiresAt;
  }

  const result = await db
    .updateTable('SplitwiseCredential')
    .set(updates)
    .where('user_id', '=', userId)
    .returningAll()
    .executeTakeFirst();

  return result ?? undefined;
}

/**
 * Delete Splitwise credential for a user
 */
export async function deleteSplitwiseCredential(userId: string): Promise<void> {
  await db
    .deleteFrom('SplitwiseCredential')
    .where('user_id', '=', userId)
    .execute();
}

/**
 * Helper: Decrypt access token from a credential row
 */
export function decryptAccessToken(credential: SplitwiseCredentialRow): string {
  return decrypt(credential.access_token);
}

/**
 * Helper: Decrypt refresh token from a credential row (if exists)
 */
export function decryptRefreshToken(credential: SplitwiseCredentialRow): string | null {
  return credential.refresh_token ? decrypt(credential.refresh_token) : null;
}
