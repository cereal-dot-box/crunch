export interface SyncSourceConfig {
  id: number;
  name: string;
  bank: string | null;
  accountType: string | null;
  accountId: number;
  emailAddress: string;
  imapHost: string;
  imapPort: number;
  imapPasswordEncrypted: string;
  imapFolder: string;
  lastProcessedUid: string | null;
  userId: string;
}

interface ActiveSourcesResponse {
  sources: SyncSourceConfig[];
}

interface SourceResponse {
  source: SyncSourceConfig;
}

export async function getActiveSyncSources(): Promise<SyncSourceConfig[]> {
  const { getEnv } = await import('./env.js');
  const { getServiceToken } = await import('../lib/jwt.js');
  const url = `${getEnv().BACKEND_URL}/api/sync-sources/active`;
  const token = await getServiceToken();
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json() as ActiveSourcesResponse;
  return data.sources;
}

export async function getSyncSource(id: number, userId: string): Promise<SyncSourceConfig | null> {
  const { getEnv } = await import('./env.js');
  const { getServiceToken } = await import('../lib/jwt.js');
  const url = `${getEnv().BACKEND_URL}/api/sync-sources/${id}?userId=${encodeURIComponent(userId)}`;
  const token = await getServiceToken();
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json() as SourceResponse;
  return data.source;
}
