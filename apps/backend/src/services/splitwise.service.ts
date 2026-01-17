import { getEnv } from '../config/env';
import { loggers } from '../lib/logger';

const log = loggers.oauth;

const SPLITWISE_AUTHORIZE_URL = 'https://secure.splitwise.com/oauth/authorize';
const SPLITWISE_TOKEN_URL = 'https://secure.splitwise.com/oauth/token';
const SPLITWISE_API_URL = 'https://www.splitwise.com/api/v3.0';

export interface SplitwiseTokenResponse {
  access_token: string;
  token_type: string;
  refresh_token?: string;
  expires_in?: number;
}

export interface SplitwiseUser {
  id: number;
  first_name: string;
  last_name: string | null;
  email: string;
  default_currency: string;
}

export interface SplitwiseGroupMember {
  id: number;
  first_name: string;
  last_name: string | null;
  email: string;
}

export interface SplitwiseGroup {
  id: number;
  name: string;
  updated_at: string;
  members: SplitwiseGroupMember[];
}

export class SplitwiseService {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor() {
    const env = getEnv();

    if (!env.SPLITWISE_CLIENT_ID || !env.SPLITWISE_CLIENT_SECRET) {
      throw new Error('SPLITWISE_CLIENT_ID and SPLITWISE_CLIENT_SECRET must be configured');
    }

    this.clientId = env.SPLITWISE_CLIENT_ID;
    this.clientSecret = env.SPLITWISE_CLIENT_SECRET;
    this.redirectUri = env.SPLITWISE_REDIRECT_URI || 'http://localhost:3001/splitwise-setup';
  }

  /**
   * Build the Splitwise OAuth authorization URL
   */
  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      state,
    });

    return `${SPLITWISE_AUTHORIZE_URL}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<SplitwiseTokenResponse> {
    log.info('Exchanging authorization code for access token');

    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      code,
      redirect_uri: this.redirectUri,
    });

    const response = await fetch(SPLITWISE_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      log.error({ status: response.status, errorText }, 'Token exchange failed');
      throw new Error(`Token exchange failed: ${response.status} ${errorText}`);
    }

    const data = await response.json() as SplitwiseTokenResponse;

    if (data.error) {
      log.error({ error: data.error }, 'Token exchange error');
      throw new Error(`Token exchange error: ${data.error}`);
    }

    log.info('Token exchange successful');

    return data;
  }

  /**
   * Get current user info from Splitwise API
   */
  async getCurrentUser(accessToken: string): Promise<SplitwiseUser> {
    log.info('Fetching current user from Splitwise');

    const response = await fetch(`${SPLITWISE_API_URL}/get_current_user`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      log.error({ status: response.status, errorText }, 'Failed to fetch user');
      throw new Error(`Failed to fetch user: ${response.status} ${errorText}`);
    }

    const data = await response.json() as { user: SplitwiseUser };

    if (!data.user) {
      log.error('No user data in response');
      throw new Error('No user data in response');
    }

    log.info({ userId: data.user.id }, 'Fetched user from Splitwise');

    return data.user;
  }

  /**
   * Calculate token expiration time
   */
  calculateTokenExpiration(expiresIn?: number): string | null {
    if (!expiresIn) return null;

    // Add 5 minute buffer to be safe
    const expiresAt = Date.now() + (expiresIn - 300) * 1000;
    return new Date(expiresAt).toISOString();
  }

  /**
   * Get user's groups from Splitwise API
   */
  async getGroups(accessToken: string): Promise<SplitwiseGroup[]> {
    log.info('Fetching groups from Splitwise');

    const response = await fetch(`${SPLITWISE_API_URL}/get_groups`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      log.error({ status: response.status, errorText }, 'Failed to fetch groups');
      throw new Error(`Failed to fetch groups: ${response.status} ${errorText}`);
    }

    const data = await response.json() as { groups: SplitwiseGroup[] };

    if (!data.groups) {
      log.error('No groups data in response');
      throw new Error('No groups data in response');
    }

    log.info({ groupCount: data.groups.length }, 'Fetched groups from Splitwise');

    return data.groups;
  }
}
