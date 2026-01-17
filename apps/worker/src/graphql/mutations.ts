import { gql } from 'graphql-request';

// Mark email as processed
export const MARK_EMAIL_PROCESSED = gql`
  mutation MarkEmailProcessed($input: MarkEmailProcessedInput!) {
    markEmailProcessed(input: $input) {
      id
      messageUid
    }
  }
`;

// Create transaction from parsed email
export const CREATE_TRANSACTION = gql`
  mutation CreateTransactionFromEmail($input: CreateTransactionFromEmailInput!) {
    createTransactionFromEmail(input: $input) {
      id
      amount
      name
    }
  }
`;

// Create balance update from parsed email
export const CREATE_BALANCE_UPDATE = gql`
  mutation CreateBalanceUpdateFromEmail($input: CreateBalanceUpdateFromEmailInput!) {
    createBalanceUpdateFromEmail(input: $input)
  }
`;

// Create DLQ entry for failed email
export const CREATE_DLQ_ENTRY = gql`
  mutation CreateDLQEntry($input: CreateDLQEntryInput!) {
    createDLQEntry(input: $input)
  }
`;
