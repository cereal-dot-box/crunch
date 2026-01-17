import { gql } from 'graphql-request';

// Check if email was already processed
export const IS_EMAIL_PROCESSED = gql`
  query IsEmailProcessed($syncSourceId: Int!, $messageUid: String!) {
    processedEmail(syncSourceId: $syncSourceId, messageUid: $messageUid) {
      id
      messageUid
    }
  }
`;

// Get sync source by ID
export const GET_SYNC_SOURCE = gql`
  query GetSyncSource($id: Int!, $userId: ID!) {
    workerSyncSource(id: $id, userId: $userId) {
      id
      name
      bank
      accountType
      accountId
    }
  }
`;
