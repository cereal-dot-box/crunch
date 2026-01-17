import { gql } from 'graphql-request';
import { getGraphQLClient } from './graphql-client';
import type { SchedulerSyncSource } from '../graphql/generated';

// GraphQL query to get all active sync sources
const GET_ACTIVE_SYNC_SOURCES = gql`
  query GetActiveSyncSources {
    activeSyncSources {
      id
      name
      bank
      accountType
      accountId
      emailAddress
      imapHost
      imapPort
      imapPasswordEncrypted
      imapFolder
      lastProcessedUid
      userId
    }
  }
`;

// GraphQL query to get a single sync source
const GET_SYNC_SOURCE = gql`
  query GetSyncSource($id: Int!, $userId: ID!) {
    workerSyncSource(id: $id, userId: $userId) {
      id
      name
      bank
      accountType
      accountId
      emailAddress
      imapHost
      imapPort
      imapPasswordEncrypted
      imapFolder
      lastProcessedUid
      userId
    }
  }
`;

export type SyncSourceConfig = SchedulerSyncSource;

export async function getActiveSyncSources(): Promise<SyncSourceConfig[]> {
  const client = getGraphQLClient();

  try {
    const response = await client.request<{
      activeSyncSources: SchedulerSyncSource[];
    }>(GET_ACTIVE_SYNC_SOURCES);

    return response.activeSyncSources;
  } catch (error) {
    console.error('Error fetching active sync sources from GraphQL:', error);
    throw error;
  }
}

export async function getSyncSource(id: number, userId: string): Promise<SyncSourceConfig | null> {
  const client = getGraphQLClient();

  try {
    const response = await client.request<{
      workerSyncSource: SchedulerSyncSource | null;
    }>(GET_SYNC_SOURCE, { id, userId });

    return response.workerSyncSource;
  } catch (error) {
    console.error('Error fetching sync source from GraphQL:', error);
    return null;
  }
}
