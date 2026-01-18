import { getServiceToken } from '../lib/jwt';

interface ProcessedEmailResponse {
  processed: boolean;
}

interface SyncSourceResponse {
  id: number;
  name: string;
  bank: string | null;
  accountType: string | null;
  accountId: number;
}

interface MarkProcessedResponse {
  id: number;
  messageUid: string;
}

interface CreateTransactionResponse {
  id: number;
  amount: number;
  name: string;
}

interface SuccessResponse {
  success: boolean;
}

async function fetchWithAuth(url: string, options?: RequestInit): Promise<Response> {
  const token = await getServiceToken();
  return fetch(url, {
    ...options,
    headers: {
      ...options?.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
}

export async function isEmailProcessed(syncSourceId: number, messageUid: string): Promise<boolean> {
  const { getEnv } = await import('./env.js');
  const url = `${getEnv().BACKEND_URL}/api/worker/processed-emails?syncSourceId=${syncSourceId}&messageUid=${encodeURIComponent(messageUid)}`;
  const response = await fetchWithAuth(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json() as ProcessedEmailResponse;
  return data.processed;
}

export async function getSyncSource(id: number, userId: string): Promise<SyncSourceResponse | null> {
  const { getEnv } = await import('./env.js');
  const url = `${getEnv().BACKEND_URL}/api/worker/sync-sources/${id}?userId=${encodeURIComponent(userId)}`;
  const response = await fetchWithAuth(url);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json() as SyncSourceResponse;
  return data;
}

export async function markEmailProcessed(userId: string, syncSourceId: number, messageUid: string): Promise<MarkProcessedResponse> {
  const { getEnv } = await import('./env.js');
  const url = `${getEnv().BACKEND_URL}/api/worker/processed-emails`;
  const response = await fetchWithAuth(url, {
    method: 'POST',
    body: JSON.stringify({ userId, syncSourceId, messageUid }),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return await response.json() as MarkProcessedResponse;
}

export async function createTransaction(input: {
  userId: string;
  accountId: number;
  syncSourceId: number;
  processedEmailId: number;
  amount: number;
  transactionDate: string;
  name: string;
  merchantName?: string;
}): Promise<CreateTransactionResponse> {
  const { getEnv } = await import('./env.js');
  const url = `${getEnv().BACKEND_URL}/api/worker/transactions`;
  const response = await fetchWithAuth(url, {
    method: 'POST',
    body: JSON.stringify(input),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return await response.json() as CreateTransactionResponse;
}

export async function createBalanceUpdate(input: {
  userId: string;
  accountId: number;
  syncSourceId: number;
  processedEmailId: number;
  balanceType: 'available_balance' | 'current_balance';
  newBalance: number;
  updateSource: string;
  sourceDetail: string;
  updateDate: string;
}): Promise<SuccessResponse> {
  const { getEnv } = await import('./env.js');
  const url = `${getEnv().BACKEND_URL}/api/worker/balance-updates`;
  const response = await fetchWithAuth(url, {
    method: 'POST',
    body: JSON.stringify(input),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return await response.json() as SuccessResponse;
}

export async function createDLQEntry(input: {
  userId: string;
  syncSourceId: number;
  messageUid: string;
  subject: string;
  fromAddress: string;
  date: string;
  bodyText: string;
  bodyHtml?: string;
  errorMessage: string;
  errorType: string;
  errorStack?: string;
}): Promise<SuccessResponse> {
  const { getEnv } = await import('./env.js');
  const url = `${getEnv().BACKEND_URL}/api/worker/dlq`;
  const response = await fetchWithAuth(url, {
    method: 'POST',
    body: JSON.stringify(input),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return await response.json() as SuccessResponse;
}
