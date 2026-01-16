import * as repo from './repository';
import type {
  SplitwiseCredentialRow,
  CreateSplitwiseCredentialParams,
  UpdateSplitwiseCredentialParams,
} from './types';

export class SplitwiseCredential {
  constructor(private data: SplitwiseCredentialRow) {}

  get id() { return this.data.id; }
  get userId() { return this.data.user_id; }
  get tokenType() { return this.data.token_type; }
  get expiresAt() { return this.data.expires_at; }
  get splitwiseUserId() { return this.data.splitwise_user_id; }
  get createdAt() { return this.data.created_at; }
  get updatedAt() { return this.data.updated_at; }

  /**
   * Get decrypted access token
   * Note: Be careful with logging or exposing this value
   */
  getAccessToken(): string {
    return repo.decryptAccessToken(this.data);
  }

  /**
   * Get decrypted refresh token (if exists)
   * Note: Be careful with logging or exposing this value
   */
  getRefreshToken(): string | null {
    return repo.decryptRefreshToken(this.data);
  }

  /**
   * Check if the token is expired
   */
  isExpired(): boolean {
    if (!this.data.expires_at) return false;
    return new Date(this.data.expires_at) < new Date();
  }

  /**
   * Check if the token will expire soon (within 5 minutes)
   */
  willExpireSoon(bufferMs: number = 5 * 60 * 1000): boolean {
    if (!this.data.expires_at) return false;
    const expiryTime = new Date(this.data.expires_at).getTime();
    return expiryTime < Date.now() + bufferMs;
  }

  toJSON(): Omit<SplitwiseCredentialRow, 'access_token' | 'refresh_token'> & { hasCredential: boolean } {
    return {
      id: this.data.id,
      user_id: this.data.user_id,
      token_type: this.data.token_type,
      expires_at: this.data.expires_at,
      splitwise_user_id: this.data.splitwise_user_id,
      created_at: this.data.created_at,
      updated_at: this.data.updated_at,
      hasCredential: true,
    };
  }

  static getByUserId: (userId: string) => Promise<SplitwiseCredential | null>;
  static getById: (id: number, userId: string) => Promise<SplitwiseCredential | null>;
  static getBySplitwiseUserId: (splitwiseUserId: string) => Promise<SplitwiseCredential | null>;
  static create: (params: CreateSplitwiseCredentialParams) => Promise<SplitwiseCredential>;
  static update: (userId: string, params: UpdateSplitwiseCredentialParams) => Promise<SplitwiseCredential | null>;
  static delete: (userId: string) => Promise<void>;
}

// Static factory methods
SplitwiseCredential.getByUserId = async (userId: string): Promise<SplitwiseCredential | null> => {
  const row = await repo.getSplitwiseCredentialByUserId(userId);
  return row ? new SplitwiseCredential(row) : null;
};

SplitwiseCredential.getById = async (id: number, userId: string): Promise<SplitwiseCredential | null> => {
  const row = await repo.getSplitwiseCredentialById(id, userId);
  return row ? new SplitwiseCredential(row) : null;
};

SplitwiseCredential.getBySplitwiseUserId = async (splitwiseUserId: string): Promise<SplitwiseCredential | null> => {
  const row = await repo.getSplitwiseCredentialBySplitwiseUserId(splitwiseUserId);
  return row ? new SplitwiseCredential(row) : null;
};

SplitwiseCredential.create = async (params: CreateSplitwiseCredentialParams): Promise<SplitwiseCredential> => {
  const row = await repo.createSplitwiseCredential(params);
  return new SplitwiseCredential(row);
};

SplitwiseCredential.update = async (userId: string, params: UpdateSplitwiseCredentialParams): Promise<SplitwiseCredential | null> => {
  const row = await repo.updateSplitwiseCredential(userId, params);
  return row ? new SplitwiseCredential(row) : null;
};

SplitwiseCredential.delete = async (userId: string): Promise<void> => {
  await repo.deleteSplitwiseCredential(userId);
};

export type { SplitwiseCredentialRow, CreateSplitwiseCredentialParams, UpdateSplitwiseCredentialParams };
