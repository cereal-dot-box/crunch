export interface SplitwiseCredentialRow {
  id: number;
  user_id: string;
  access_token: string; // Encrypted
  refresh_token: string | null; // Encrypted
  token_type: string;
  expires_at: string | null;
  splitwise_user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSplitwiseCredentialParams {
  userId: string;
  accessToken: string; // Plain text - will be encrypted by repository
  refreshToken?: string; // Plain text - will be encrypted by repository
  tokenType?: string;
  expiresAt?: string | null;
  splitwiseUserId: string;
}

export interface UpdateSplitwiseCredentialParams {
  accessToken?: string; // Plain text - will be encrypted by repository
  refreshToken?: string; // Plain text - will be encrypted by repository
  expiresAt?: string | null;
}
