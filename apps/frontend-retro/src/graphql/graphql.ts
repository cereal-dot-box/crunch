/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type Account = {
  __typename?: 'Account';
  available_balance?: Maybe<Scalars['Float']['output']>;
  bank?: Maybe<Scalars['String']['output']>;
  created_at: Scalars['String']['output'];
  current_balance?: Maybe<Scalars['Float']['output']>;
  id: Scalars['Int']['output'];
  is_active: Scalars['Boolean']['output'];
  iso_currency_code: Scalars['String']['output'];
  mask?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  type?: Maybe<Scalars['String']['output']>;
  updated_at: Scalars['String']['output'];
};

export type AddAccountInput = {
  bank: Scalars['String']['input'];
  iso_currency_code: Scalars['String']['input'];
  mask: Scalars['String']['input'];
  name: Scalars['String']['input'];
  type: Scalars['String']['input'];
};

export type AddSyncSourceInput = {
  account_id: Scalars['Int']['input'];
  email_address: Scalars['String']['input'];
  imap_folder?: InputMaybe<Scalars['String']['input']>;
  imap_host: Scalars['String']['input'];
  imap_password: Scalars['String']['input'];
  imap_port: Scalars['Int']['input'];
  name: Scalars['String']['input'];
};

export type AvailableBankType = {
  __typename?: 'AvailableBankType';
  bank: Scalars['String']['output'];
  types: Array<Scalars['String']['output']>;
};

export type BudgetBucket = {
  __typename?: 'BudgetBucket';
  bucket_id: Scalars['String']['output'];
  color: Scalars['String']['output'];
  created_at: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  is_active: Scalars['Boolean']['output'];
  monthly_limit: Scalars['Float']['output'];
  name: Scalars['String']['output'];
  updated_at: Scalars['String']['output'];
};

export type CreateMonthlyPeriodInput = {
  month: Scalars['String']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  projected_income: Scalars['Float']['input'];
};

export type MonthlyPeriod = {
  __typename?: 'MonthlyPeriod';
  actual_income: Scalars['Float']['output'];
  created_at: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  is_closed: Scalars['Boolean']['output'];
  is_open: Scalars['Boolean']['output'];
  month: Scalars['String']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  projected_income: Scalars['Float']['output'];
  status: Scalars['String']['output'];
  updated_at: Scalars['String']['output'];
  user_id: Scalars['ID']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  add_account: Account;
  add_sync_source: SyncSource;
  close_monthly_period: MonthlyPeriod;
  create_monthly_period: MonthlyPeriod;
  deactivate_account: Scalars['Boolean']['output'];
  delete_monthly_period: Scalars['Boolean']['output'];
  delete_sync_source: Scalars['Boolean']['output'];
  initialize_default_buckets: Array<BudgetBucket>;
  splitwise_complete_oauth: SplitwiseCredential;
  splitwise_disconnect: Scalars['Boolean']['output'];
  splitwise_update_settings: SplitwiseSetting;
  sync_accounts: Scalars['Boolean']['output'];
  sync_sync_source: SyncResult;
  test_sync_source_connection: TestConnectionResult;
  update_budget_bucket: BudgetBucket;
  update_monthly_period: MonthlyPeriod;
  update_sync_source: SyncSource;
};


export type MutationAdd_AccountArgs = {
  input: AddAccountInput;
  userId: Scalars['ID']['input'];
};


export type MutationAdd_Sync_SourceArgs = {
  input: AddSyncSourceInput;
  userId: Scalars['ID']['input'];
};


export type MutationClose_Monthly_PeriodArgs = {
  id: Scalars['Int']['input'];
  userId: Scalars['ID']['input'];
};


export type MutationCreate_Monthly_PeriodArgs = {
  input: CreateMonthlyPeriodInput;
  userId: Scalars['ID']['input'];
};


export type MutationDeactivate_AccountArgs = {
  account_id: Scalars['Int']['input'];
  userId: Scalars['ID']['input'];
};


export type MutationDelete_Monthly_PeriodArgs = {
  id: Scalars['Int']['input'];
  userId: Scalars['ID']['input'];
};


export type MutationDelete_Sync_SourceArgs = {
  id: Scalars['Int']['input'];
  userId: Scalars['ID']['input'];
};


export type MutationInitialize_Default_BucketsArgs = {
  userId: Scalars['ID']['input'];
};


export type MutationSplitwise_Complete_OauthArgs = {
  code: Scalars['String']['input'];
  state: Scalars['String']['input'];
  userId: Scalars['ID']['input'];
};


export type MutationSplitwise_DisconnectArgs = {
  userId: Scalars['ID']['input'];
};


export type MutationSplitwise_Update_SettingsArgs = {
  input: UpdateSplitwiseSettingsInput;
  userId: Scalars['ID']['input'];
};


export type MutationSync_AccountsArgs = {
  userId: Scalars['ID']['input'];
};


export type MutationSync_Sync_SourceArgs = {
  id: Scalars['Int']['input'];
  userId: Scalars['ID']['input'];
};


export type MutationTest_Sync_Source_ConnectionArgs = {
  id: Scalars['Int']['input'];
  userId: Scalars['ID']['input'];
};


export type MutationUpdate_Budget_BucketArgs = {
  bucket_id: Scalars['String']['input'];
  input: UpdateBudgetBucketInput;
  userId: Scalars['ID']['input'];
};


export type MutationUpdate_Monthly_PeriodArgs = {
  id: Scalars['Int']['input'];
  input: UpdateMonthlyPeriodInput;
  userId: Scalars['ID']['input'];
};


export type MutationUpdate_Sync_SourceArgs = {
  id: Scalars['Int']['input'];
  input: UpdateSyncSourceInput;
  userId: Scalars['ID']['input'];
};

export type Query = {
  __typename?: 'Query';
  accounts: Array<Account>;
  available_bank_types: Array<AvailableBankType>;
  budget_bucket?: Maybe<BudgetBucket>;
  budget_buckets: Array<BudgetBucket>;
  current_monthly_period?: Maybe<MonthlyPeriod>;
  monthly_period?: Maybe<MonthlyPeriod>;
  monthly_periods: Array<MonthlyPeriod>;
  splitwise_authorize_url: SplitwiseAuthorizeUrl;
  splitwise_credential?: Maybe<SplitwiseCredential>;
  splitwise_groups: Array<SplitwiseGroup>;
  splitwise_settings: SplitwiseSetting;
  sync_source?: Maybe<SyncSource>;
  sync_sources: Array<SyncSource>;
  sync_sources_by_account: Array<SyncSource>;
  transaction?: Maybe<Transaction>;
  transactions: TransactionListResponse;
  transactions_by_account: TransactionListResponse;
};


export type QueryAccountsArgs = {
  userId: Scalars['ID']['input'];
};


export type QueryBudget_BucketArgs = {
  bucket_id: Scalars['String']['input'];
  userId: Scalars['ID']['input'];
};


export type QueryBudget_BucketsArgs = {
  userId: Scalars['ID']['input'];
};


export type QueryCurrent_Monthly_PeriodArgs = {
  userId: Scalars['ID']['input'];
};


export type QueryMonthly_PeriodArgs = {
  month: Scalars['String']['input'];
  userId: Scalars['ID']['input'];
};


export type QueryMonthly_PeriodsArgs = {
  userId: Scalars['ID']['input'];
};


export type QuerySplitwise_Authorize_UrlArgs = {
  userId: Scalars['ID']['input'];
};


export type QuerySplitwise_CredentialArgs = {
  userId: Scalars['ID']['input'];
};


export type QuerySplitwise_GroupsArgs = {
  userId: Scalars['ID']['input'];
};


export type QuerySplitwise_SettingsArgs = {
  userId: Scalars['ID']['input'];
};


export type QuerySync_SourceArgs = {
  id: Scalars['Int']['input'];
  userId: Scalars['ID']['input'];
};


export type QuerySync_SourcesArgs = {
  userId: Scalars['ID']['input'];
};


export type QuerySync_Sources_By_AccountArgs = {
  account_id: Scalars['Int']['input'];
  userId: Scalars['ID']['input'];
};


export type QueryTransactionArgs = {
  id: Scalars['Int']['input'];
  userId: Scalars['ID']['input'];
};


export type QueryTransactionsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  userId: Scalars['ID']['input'];
};


export type QueryTransactions_By_AccountArgs = {
  account_id: Scalars['Int']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  userId: Scalars['ID']['input'];
};

export type SplitwiseAuthorizeUrl = {
  __typename?: 'SplitwiseAuthorizeUrl';
  url: Scalars['String']['output'];
};

export type SplitwiseCredential = {
  __typename?: 'SplitwiseCredential';
  created_at: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  splitwise_user_id: Scalars['ID']['output'];
  updated_at: Scalars['String']['output'];
  user_id: Scalars['ID']['output'];
};

export type SplitwiseGroup = {
  __typename?: 'SplitwiseGroup';
  id: Scalars['Int']['output'];
  members: Array<SplitwiseGroupMember>;
  name: Scalars['String']['output'];
  updated_at: Scalars['String']['output'];
};

export type SplitwiseGroupMember = {
  __typename?: 'SplitwiseGroupMember';
  email: Scalars['String']['output'];
  first_name: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  last_name?: Maybe<Scalars['String']['output']>;
};

export type SplitwiseSetting = {
  __typename?: 'SplitwiseSetting';
  auto_sync_enabled: Scalars['Boolean']['output'];
  created_at: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  included_group_ids: Array<Scalars['Int']['output']>;
  updated_at: Scalars['String']['output'];
  user_id: Scalars['ID']['output'];
};

export type SyncResult = {
  __typename?: 'SyncResult';
  duration: Scalars['Int']['output'];
  emails_fetched: Scalars['Int']['output'];
  errors: Scalars['Int']['output'];
  jobs_enqueued: Scalars['Int']['output'];
  timestamp: Scalars['String']['output'];
};

export type SyncSource = {
  __typename?: 'SyncSource';
  account_id: Scalars['Int']['output'];
  balance_count?: Maybe<Scalars['Int']['output']>;
  created_at: Scalars['String']['output'];
  email_address: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  imap_folder: Scalars['String']['output'];
  imap_host: Scalars['String']['output'];
  imap_port: Scalars['Int']['output'];
  is_active: Scalars['Boolean']['output'];
  last_processed_uid?: Maybe<Scalars['String']['output']>;
  last_synced_at?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  status: Scalars['String']['output'];
  transaction_count?: Maybe<Scalars['Int']['output']>;
};

export type TestConnectionResult = {
  __typename?: 'TestConnectionResult';
  error_message?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type Transaction = {
  __typename?: 'Transaction';
  account_id: Scalars['Int']['output'];
  amount: Scalars['Float']['output'];
  authorized_date?: Maybe<Scalars['String']['output']>;
  created_at: Scalars['String']['output'];
  date: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  iso_currency_code: Scalars['String']['output'];
  merchant_name?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  payment_channel?: Maybe<Scalars['String']['output']>;
  pending: Scalars['Boolean']['output'];
  transaction_id: Scalars['String']['output'];
  updated_at: Scalars['String']['output'];
};

export type TransactionListResponse = {
  __typename?: 'TransactionListResponse';
  total: Scalars['Int']['output'];
  transactions: Array<Transaction>;
};

export type UpdateBudgetBucketInput = {
  color?: InputMaybe<Scalars['String']['input']>;
  monthly_limit?: InputMaybe<Scalars['Float']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateMonthlyPeriodInput = {
  actual_income?: InputMaybe<Scalars['Float']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  projected_income?: InputMaybe<Scalars['Float']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateSplitwiseSettingsInput = {
  auto_sync_enabled?: InputMaybe<Scalars['Boolean']['input']>;
  included_group_ids?: InputMaybe<Array<Scalars['Int']['input']>>;
};

export type UpdateSyncSourceInput = {
  email_address?: InputMaybe<Scalars['String']['input']>;
  imap_folder?: InputMaybe<Scalars['String']['input']>;
  imap_host?: InputMaybe<Scalars['String']['input']>;
  imap_password?: InputMaybe<Scalars['String']['input']>;
  imap_port?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type DeactivateAccountMutationVariables = Exact<{
  userId: Scalars['ID']['input'];
  account_id: Scalars['Int']['input'];
}>;


export type DeactivateAccountMutation = { __typename?: 'Mutation', deactivate_account: boolean };

export type AddAccountMutationVariables = Exact<{
  userId: Scalars['ID']['input'];
  input: AddAccountInput;
}>;


export type AddAccountMutation = { __typename?: 'Mutation', add_account: { __typename?: 'Account', id: number, name: string, bank?: string | null, type?: string | null, mask?: string | null, current_balance?: number | null, available_balance?: number | null, iso_currency_code: string, is_active: boolean, created_at: string, updated_at: string } };

export type UpdateBudgetBucketMutationVariables = Exact<{
  userId: Scalars['ID']['input'];
  bucketId: Scalars['String']['input'];
  input: UpdateBudgetBucketInput;
}>;


export type UpdateBudgetBucketMutation = { __typename?: 'Mutation', update_budget_bucket: { __typename?: 'BudgetBucket', id: number, bucket_id: string, name: string, monthly_limit: number, color: string, is_active: boolean, created_at: string, updated_at: string } };

export type CreateMonthlyPeriodMutationVariables = Exact<{
  userId: Scalars['ID']['input'];
  input: CreateMonthlyPeriodInput;
}>;


export type CreateMonthlyPeriodMutation = { __typename?: 'Mutation', create_monthly_period: { __typename?: 'MonthlyPeriod', id: number, user_id: string, month: string, projected_income: number, actual_income: number, status: string, notes?: string | null, created_at: string, updated_at: string, is_open: boolean } };

export type UpdateMonthlyPeriodMutationVariables = Exact<{
  userId: Scalars['ID']['input'];
  id: Scalars['Int']['input'];
  input: UpdateMonthlyPeriodInput;
}>;


export type UpdateMonthlyPeriodMutation = { __typename?: 'Mutation', update_monthly_period: { __typename?: 'MonthlyPeriod', id: number, user_id: string, month: string, projected_income: number, actual_income: number, status: string, notes?: string | null, created_at: string, updated_at: string, is_open: boolean, is_closed: boolean } };

export type CloseMonthlyPeriodMutationVariables = Exact<{
  userId: Scalars['ID']['input'];
  id: Scalars['Int']['input'];
}>;


export type CloseMonthlyPeriodMutation = { __typename?: 'Mutation', close_monthly_period: { __typename?: 'MonthlyPeriod', id: number, user_id: string, month: string, projected_income: number, actual_income: number, status: string, notes?: string | null, created_at: string, updated_at: string, is_open: boolean, is_closed: boolean } };

export type DeleteMonthlyPeriodMutationVariables = Exact<{
  userId: Scalars['ID']['input'];
  id: Scalars['Int']['input'];
}>;


export type DeleteMonthlyPeriodMutation = { __typename?: 'Mutation', delete_monthly_period: boolean };

export type SplitwiseCompleteOAuthMutationVariables = Exact<{
  userId: Scalars['ID']['input'];
  code: Scalars['String']['input'];
  state: Scalars['String']['input'];
}>;


export type SplitwiseCompleteOAuthMutation = { __typename?: 'Mutation', splitwise_complete_oauth: { __typename?: 'SplitwiseCredential', id: number, user_id: string, splitwise_user_id: string, created_at: string, updated_at: string } };

export type SplitwiseDisconnectMutationVariables = Exact<{
  userId: Scalars['ID']['input'];
}>;


export type SplitwiseDisconnectMutation = { __typename?: 'Mutation', splitwise_disconnect: boolean };

export type SplitwiseUpdateSettingsMutationVariables = Exact<{
  userId: Scalars['ID']['input'];
  input: UpdateSplitwiseSettingsInput;
}>;


export type SplitwiseUpdateSettingsMutation = { __typename?: 'Mutation', splitwise_update_settings: { __typename?: 'SplitwiseSetting', id: number, user_id: string, included_group_ids: Array<number>, auto_sync_enabled: boolean, created_at: string, updated_at: string } };

export type AddSyncSourceMutationVariables = Exact<{
  userId: Scalars['ID']['input'];
  input: AddSyncSourceInput;
}>;


export type AddSyncSourceMutation = { __typename?: 'Mutation', add_sync_source: { __typename?: 'SyncSource', id: number, account_id: number, name: string, email_address: string, imap_host: string, imap_port: number, imap_folder: string, status: string, last_synced_at?: string | null, last_processed_uid?: string | null, is_active: boolean, created_at: string, balance_count?: number | null, transaction_count?: number | null } };

export type UpdateSyncSourceMutationVariables = Exact<{
  userId: Scalars['ID']['input'];
  id: Scalars['Int']['input'];
  input: UpdateSyncSourceInput;
}>;


export type UpdateSyncSourceMutation = { __typename?: 'Mutation', update_sync_source: { __typename?: 'SyncSource', id: number, account_id: number, name: string, email_address: string, imap_host: string, imap_port: number, imap_folder: string, status: string, last_synced_at?: string | null, last_processed_uid?: string | null, is_active: boolean, created_at: string, balance_count?: number | null, transaction_count?: number | null } };

export type DeleteSyncSourceMutationVariables = Exact<{
  userId: Scalars['ID']['input'];
  id: Scalars['Int']['input'];
}>;


export type DeleteSyncSourceMutation = { __typename?: 'Mutation', delete_sync_source: boolean };

export type TestSyncSourceConnectionMutationVariables = Exact<{
  userId: Scalars['ID']['input'];
  id: Scalars['Int']['input'];
}>;


export type TestSyncSourceConnectionMutation = { __typename?: 'Mutation', test_sync_source_connection: { __typename?: 'TestConnectionResult', success: boolean, error_message?: string | null } };

export type SyncSyncSourceMutationVariables = Exact<{
  userId: Scalars['ID']['input'];
  id: Scalars['Int']['input'];
}>;


export type SyncSyncSourceMutation = { __typename?: 'Mutation', sync_sync_source: { __typename?: 'SyncResult', timestamp: string, emails_fetched: number, jobs_enqueued: number, errors: number, duration: number } };

export type AccountsQueryVariables = Exact<{
  userId: Scalars['ID']['input'];
}>;


export type AccountsQuery = { __typename?: 'Query', accounts: Array<{ __typename?: 'Account', id: number, name: string, bank?: string | null, type?: string | null, mask?: string | null, current_balance?: number | null, available_balance?: number | null, iso_currency_code: string, is_active: boolean, created_at: string, updated_at: string }> };

export type GetBudgetBucketsQueryVariables = Exact<{
  userId: Scalars['ID']['input'];
}>;


export type GetBudgetBucketsQuery = { __typename?: 'Query', budget_buckets: Array<{ __typename?: 'BudgetBucket', id: number, bucket_id: string, name: string, monthly_limit: number, color: string, is_active: boolean, created_at: string, updated_at: string }> };

export type GetBudgetBucketQueryVariables = Exact<{
  userId: Scalars['ID']['input'];
  bucketId: Scalars['String']['input'];
}>;


export type GetBudgetBucketQuery = { __typename?: 'Query', budget_bucket?: { __typename?: 'BudgetBucket', id: number, bucket_id: string, name: string, monthly_limit: number, color: string, is_active: boolean, created_at: string, updated_at: string } | null };

export type GetMonthlyPeriodsQueryVariables = Exact<{
  userId: Scalars['ID']['input'];
}>;


export type GetMonthlyPeriodsQuery = { __typename?: 'Query', monthly_periods: Array<{ __typename?: 'MonthlyPeriod', id: number, user_id: string, month: string, projected_income: number, actual_income: number, status: string, notes?: string | null, created_at: string, updated_at: string, is_open: boolean, is_closed: boolean }> };

export type GetCurrentMonthlyPeriodQueryVariables = Exact<{
  userId: Scalars['ID']['input'];
}>;


export type GetCurrentMonthlyPeriodQuery = { __typename?: 'Query', current_monthly_period?: { __typename?: 'MonthlyPeriod', id: number, user_id: string, month: string, projected_income: number, actual_income: number, status: string, notes?: string | null, created_at: string, updated_at: string, is_open: boolean } | null };

export type GetMonthlyPeriodQueryVariables = Exact<{
  userId: Scalars['ID']['input'];
  month: Scalars['String']['input'];
}>;


export type GetMonthlyPeriodQuery = { __typename?: 'Query', monthly_period?: { __typename?: 'MonthlyPeriod', id: number, user_id: string, month: string, projected_income: number, actual_income: number, status: string, notes?: string | null, created_at: string, updated_at: string, is_open: boolean, is_closed: boolean } | null };

export type SplitwiseAuthorizeUrlQueryVariables = Exact<{
  userId: Scalars['ID']['input'];
}>;


export type SplitwiseAuthorizeUrlQuery = { __typename?: 'Query', splitwise_authorize_url: { __typename?: 'SplitwiseAuthorizeUrl', url: string } };

export type SplitwiseCredentialQueryVariables = Exact<{
  userId: Scalars['ID']['input'];
}>;


export type SplitwiseCredentialQuery = { __typename?: 'Query', splitwise_credential?: { __typename?: 'SplitwiseCredential', id: number, user_id: string, splitwise_user_id: string, created_at: string, updated_at: string } | null };

export type SplitwiseGroupsQueryVariables = Exact<{
  userId: Scalars['ID']['input'];
}>;


export type SplitwiseGroupsQuery = { __typename?: 'Query', splitwise_groups: Array<{ __typename?: 'SplitwiseGroup', id: number, name: string, updated_at: string, members: Array<{ __typename?: 'SplitwiseGroupMember', id: number, first_name: string, last_name?: string | null, email: string }> }> };

export type SplitwiseSettingsQueryVariables = Exact<{
  userId: Scalars['ID']['input'];
}>;


export type SplitwiseSettingsQuery = { __typename?: 'Query', splitwise_settings: { __typename?: 'SplitwiseSetting', id: number, user_id: string, included_group_ids: Array<number>, auto_sync_enabled: boolean, created_at: string, updated_at: string } };

export type SyncSourcesByAccountQueryVariables = Exact<{
  userId: Scalars['ID']['input'];
  account_id: Scalars['Int']['input'];
}>;


export type SyncSourcesByAccountQuery = { __typename?: 'Query', sync_sources_by_account: Array<{ __typename?: 'SyncSource', id: number, account_id: number, name: string, email_address: string, imap_host: string, imap_port: number, imap_folder: string, status: string, last_synced_at?: string | null, last_processed_uid?: string | null, is_active: boolean, created_at: string, balance_count?: number | null, transaction_count?: number | null }> };

export type AvailableBankTypesQueryVariables = Exact<{ [key: string]: never; }>;


export type AvailableBankTypesQuery = { __typename?: 'Query', available_bank_types: Array<{ __typename?: 'AvailableBankType', bank: string, types: Array<string> }> };

export type TransactionsQueryVariables = Exact<{
  userId: Scalars['ID']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
}>;


export type TransactionsQuery = { __typename?: 'Query', transactions: { __typename?: 'TransactionListResponse', total: number, transactions: Array<{ __typename?: 'Transaction', id: number, transaction_id: string, account_id: number, amount: number, iso_currency_code: string, date: string, authorized_date?: string | null, name: string, merchant_name?: string | null, pending: boolean, payment_channel?: string | null, created_at: string }> } };

export type TransactionsByAccountQueryVariables = Exact<{
  userId: Scalars['ID']['input'];
  account_id: Scalars['Int']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
}>;


export type TransactionsByAccountQuery = { __typename?: 'Query', transactions_by_account: { __typename?: 'TransactionListResponse', total: number, transactions: Array<{ __typename?: 'Transaction', id: number, transaction_id: string, account_id: number, amount: number, iso_currency_code: string, date: string, authorized_date?: string | null, name: string, merchant_name?: string | null, pending: boolean, payment_channel?: string | null, created_at: string }> } };

export type TransactionQueryVariables = Exact<{
  userId: Scalars['ID']['input'];
  id: Scalars['Int']['input'];
}>;


export type TransactionQuery = { __typename?: 'Query', transaction?: { __typename?: 'Transaction', id: number, transaction_id: string, account_id: number, amount: number, iso_currency_code: string, date: string, authorized_date?: string | null, name: string, merchant_name?: string | null, pending: boolean, payment_channel?: string | null, created_at: string, updated_at: string } | null };


export const DeactivateAccountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeactivateAccount"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"account_id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deactivate_account"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}},{"kind":"Argument","name":{"kind":"Name","value":"account_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"account_id"}}}]}]}}]} as unknown as DocumentNode<DeactivateAccountMutation, DeactivateAccountMutationVariables>;
export const AddAccountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddAccount"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AddAccountInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"add_account"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"bank"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"mask"}},{"kind":"Field","name":{"kind":"Name","value":"current_balance"}},{"kind":"Field","name":{"kind":"Name","value":"available_balance"}},{"kind":"Field","name":{"kind":"Name","value":"iso_currency_code"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}}]}}]}}]} as unknown as DocumentNode<AddAccountMutation, AddAccountMutationVariables>;
export const UpdateBudgetBucketDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateBudgetBucket"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"bucketId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateBudgetBucketInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"update_budget_bucket"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}},{"kind":"Argument","name":{"kind":"Name","value":"bucket_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"bucketId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"bucket_id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"monthly_limit"}},{"kind":"Field","name":{"kind":"Name","value":"color"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}}]}}]}}]} as unknown as DocumentNode<UpdateBudgetBucketMutation, UpdateBudgetBucketMutationVariables>;
export const CreateMonthlyPeriodDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateMonthlyPeriod"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateMonthlyPeriodInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"create_monthly_period"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"user_id"}},{"kind":"Field","name":{"kind":"Name","value":"month"}},{"kind":"Field","name":{"kind":"Name","value":"projected_income"}},{"kind":"Field","name":{"kind":"Name","value":"actual_income"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}},{"kind":"Field","name":{"kind":"Name","value":"is_open"}}]}}]}}]} as unknown as DocumentNode<CreateMonthlyPeriodMutation, CreateMonthlyPeriodMutationVariables>;
export const UpdateMonthlyPeriodDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateMonthlyPeriod"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateMonthlyPeriodInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"update_monthly_period"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"user_id"}},{"kind":"Field","name":{"kind":"Name","value":"month"}},{"kind":"Field","name":{"kind":"Name","value":"projected_income"}},{"kind":"Field","name":{"kind":"Name","value":"actual_income"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}},{"kind":"Field","name":{"kind":"Name","value":"is_open"}},{"kind":"Field","name":{"kind":"Name","value":"is_closed"}}]}}]}}]} as unknown as DocumentNode<UpdateMonthlyPeriodMutation, UpdateMonthlyPeriodMutationVariables>;
export const CloseMonthlyPeriodDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CloseMonthlyPeriod"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"close_monthly_period"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"user_id"}},{"kind":"Field","name":{"kind":"Name","value":"month"}},{"kind":"Field","name":{"kind":"Name","value":"projected_income"}},{"kind":"Field","name":{"kind":"Name","value":"actual_income"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}},{"kind":"Field","name":{"kind":"Name","value":"is_open"}},{"kind":"Field","name":{"kind":"Name","value":"is_closed"}}]}}]}}]} as unknown as DocumentNode<CloseMonthlyPeriodMutation, CloseMonthlyPeriodMutationVariables>;
export const DeleteMonthlyPeriodDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteMonthlyPeriod"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"delete_monthly_period"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteMonthlyPeriodMutation, DeleteMonthlyPeriodMutationVariables>;
export const SplitwiseCompleteOAuthDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SplitwiseCompleteOAuth"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"code"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"state"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"splitwise_complete_oauth"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}},{"kind":"Argument","name":{"kind":"Name","value":"code"},"value":{"kind":"Variable","name":{"kind":"Name","value":"code"}}},{"kind":"Argument","name":{"kind":"Name","value":"state"},"value":{"kind":"Variable","name":{"kind":"Name","value":"state"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"user_id"}},{"kind":"Field","name":{"kind":"Name","value":"splitwise_user_id"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}}]}}]}}]} as unknown as DocumentNode<SplitwiseCompleteOAuthMutation, SplitwiseCompleteOAuthMutationVariables>;
export const SplitwiseDisconnectDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SplitwiseDisconnect"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"splitwise_disconnect"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}}]}]}}]} as unknown as DocumentNode<SplitwiseDisconnectMutation, SplitwiseDisconnectMutationVariables>;
export const SplitwiseUpdateSettingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SplitwiseUpdateSettings"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateSplitwiseSettingsInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"splitwise_update_settings"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"user_id"}},{"kind":"Field","name":{"kind":"Name","value":"included_group_ids"}},{"kind":"Field","name":{"kind":"Name","value":"auto_sync_enabled"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}}]}}]}}]} as unknown as DocumentNode<SplitwiseUpdateSettingsMutation, SplitwiseUpdateSettingsMutationVariables>;
export const AddSyncSourceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddSyncSource"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AddSyncSourceInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"add_sync_source"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"account_id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email_address"}},{"kind":"Field","name":{"kind":"Name","value":"imap_host"}},{"kind":"Field","name":{"kind":"Name","value":"imap_port"}},{"kind":"Field","name":{"kind":"Name","value":"imap_folder"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"last_synced_at"}},{"kind":"Field","name":{"kind":"Name","value":"last_processed_uid"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"balance_count"}},{"kind":"Field","name":{"kind":"Name","value":"transaction_count"}}]}}]}}]} as unknown as DocumentNode<AddSyncSourceMutation, AddSyncSourceMutationVariables>;
export const UpdateSyncSourceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateSyncSource"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateSyncSourceInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"update_sync_source"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"account_id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email_address"}},{"kind":"Field","name":{"kind":"Name","value":"imap_host"}},{"kind":"Field","name":{"kind":"Name","value":"imap_port"}},{"kind":"Field","name":{"kind":"Name","value":"imap_folder"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"last_synced_at"}},{"kind":"Field","name":{"kind":"Name","value":"last_processed_uid"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"balance_count"}},{"kind":"Field","name":{"kind":"Name","value":"transaction_count"}}]}}]}}]} as unknown as DocumentNode<UpdateSyncSourceMutation, UpdateSyncSourceMutationVariables>;
export const DeleteSyncSourceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteSyncSource"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"delete_sync_source"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteSyncSourceMutation, DeleteSyncSourceMutationVariables>;
export const TestSyncSourceConnectionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"TestSyncSourceConnection"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"test_sync_source_connection"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"error_message"}}]}}]}}]} as unknown as DocumentNode<TestSyncSourceConnectionMutation, TestSyncSourceConnectionMutationVariables>;
export const SyncSyncSourceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SyncSyncSource"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sync_sync_source"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"timestamp"}},{"kind":"Field","name":{"kind":"Name","value":"emails_fetched"}},{"kind":"Field","name":{"kind":"Name","value":"jobs_enqueued"}},{"kind":"Field","name":{"kind":"Name","value":"errors"}},{"kind":"Field","name":{"kind":"Name","value":"duration"}}]}}]}}]} as unknown as DocumentNode<SyncSyncSourceMutation, SyncSyncSourceMutationVariables>;
export const AccountsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Accounts"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accounts"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"bank"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"mask"}},{"kind":"Field","name":{"kind":"Name","value":"current_balance"}},{"kind":"Field","name":{"kind":"Name","value":"available_balance"}},{"kind":"Field","name":{"kind":"Name","value":"iso_currency_code"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}}]}}]}}]} as unknown as DocumentNode<AccountsQuery, AccountsQueryVariables>;
export const GetBudgetBucketsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetBudgetBuckets"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"budget_buckets"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"bucket_id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"monthly_limit"}},{"kind":"Field","name":{"kind":"Name","value":"color"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}}]}}]}}]} as unknown as DocumentNode<GetBudgetBucketsQuery, GetBudgetBucketsQueryVariables>;
export const GetBudgetBucketDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetBudgetBucket"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"bucketId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"budget_bucket"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}},{"kind":"Argument","name":{"kind":"Name","value":"bucket_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"bucketId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"bucket_id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"monthly_limit"}},{"kind":"Field","name":{"kind":"Name","value":"color"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}}]}}]}}]} as unknown as DocumentNode<GetBudgetBucketQuery, GetBudgetBucketQueryVariables>;
export const GetMonthlyPeriodsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMonthlyPeriods"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"monthly_periods"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"user_id"}},{"kind":"Field","name":{"kind":"Name","value":"month"}},{"kind":"Field","name":{"kind":"Name","value":"projected_income"}},{"kind":"Field","name":{"kind":"Name","value":"actual_income"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}},{"kind":"Field","name":{"kind":"Name","value":"is_open"}},{"kind":"Field","name":{"kind":"Name","value":"is_closed"}}]}}]}}]} as unknown as DocumentNode<GetMonthlyPeriodsQuery, GetMonthlyPeriodsQueryVariables>;
export const GetCurrentMonthlyPeriodDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetCurrentMonthlyPeriod"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"current_monthly_period"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"user_id"}},{"kind":"Field","name":{"kind":"Name","value":"month"}},{"kind":"Field","name":{"kind":"Name","value":"projected_income"}},{"kind":"Field","name":{"kind":"Name","value":"actual_income"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}},{"kind":"Field","name":{"kind":"Name","value":"is_open"}}]}}]}}]} as unknown as DocumentNode<GetCurrentMonthlyPeriodQuery, GetCurrentMonthlyPeriodQueryVariables>;
export const GetMonthlyPeriodDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMonthlyPeriod"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"month"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"monthly_period"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}},{"kind":"Argument","name":{"kind":"Name","value":"month"},"value":{"kind":"Variable","name":{"kind":"Name","value":"month"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"user_id"}},{"kind":"Field","name":{"kind":"Name","value":"month"}},{"kind":"Field","name":{"kind":"Name","value":"projected_income"}},{"kind":"Field","name":{"kind":"Name","value":"actual_income"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}},{"kind":"Field","name":{"kind":"Name","value":"is_open"}},{"kind":"Field","name":{"kind":"Name","value":"is_closed"}}]}}]}}]} as unknown as DocumentNode<GetMonthlyPeriodQuery, GetMonthlyPeriodQueryVariables>;
export const SplitwiseAuthorizeUrlDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SplitwiseAuthorizeUrl"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"splitwise_authorize_url"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]} as unknown as DocumentNode<SplitwiseAuthorizeUrlQuery, SplitwiseAuthorizeUrlQueryVariables>;
export const SplitwiseCredentialDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SplitwiseCredential"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"splitwise_credential"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"user_id"}},{"kind":"Field","name":{"kind":"Name","value":"splitwise_user_id"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}}]}}]}}]} as unknown as DocumentNode<SplitwiseCredentialQuery, SplitwiseCredentialQueryVariables>;
export const SplitwiseGroupsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SplitwiseGroups"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"splitwise_groups"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}},{"kind":"Field","name":{"kind":"Name","value":"members"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"first_name"}},{"kind":"Field","name":{"kind":"Name","value":"last_name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]}}]}}]} as unknown as DocumentNode<SplitwiseGroupsQuery, SplitwiseGroupsQueryVariables>;
export const SplitwiseSettingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SplitwiseSettings"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"splitwise_settings"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"user_id"}},{"kind":"Field","name":{"kind":"Name","value":"included_group_ids"}},{"kind":"Field","name":{"kind":"Name","value":"auto_sync_enabled"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}}]}}]}}]} as unknown as DocumentNode<SplitwiseSettingsQuery, SplitwiseSettingsQueryVariables>;
export const SyncSourcesByAccountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SyncSourcesByAccount"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"account_id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sync_sources_by_account"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}},{"kind":"Argument","name":{"kind":"Name","value":"account_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"account_id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"account_id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email_address"}},{"kind":"Field","name":{"kind":"Name","value":"imap_host"}},{"kind":"Field","name":{"kind":"Name","value":"imap_port"}},{"kind":"Field","name":{"kind":"Name","value":"imap_folder"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"last_synced_at"}},{"kind":"Field","name":{"kind":"Name","value":"last_processed_uid"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"balance_count"}},{"kind":"Field","name":{"kind":"Name","value":"transaction_count"}}]}}]}}]} as unknown as DocumentNode<SyncSourcesByAccountQuery, SyncSourcesByAccountQueryVariables>;
export const AvailableBankTypesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AvailableBankTypes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"available_bank_types"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"bank"}},{"kind":"Field","name":{"kind":"Name","value":"types"}}]}}]}}]} as unknown as DocumentNode<AvailableBankTypesQuery, AvailableBankTypesQueryVariables>;
export const TransactionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Transactions"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"transactions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"transactions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"transaction_id"}},{"kind":"Field","name":{"kind":"Name","value":"account_id"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"iso_currency_code"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"authorized_date"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"merchant_name"}},{"kind":"Field","name":{"kind":"Name","value":"pending"}},{"kind":"Field","name":{"kind":"Name","value":"payment_channel"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"}}]}}]}}]} as unknown as DocumentNode<TransactionsQuery, TransactionsQueryVariables>;
export const TransactionsByAccountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TransactionsByAccount"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"account_id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"transactions_by_account"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}},{"kind":"Argument","name":{"kind":"Name","value":"account_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"account_id"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"transactions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"transaction_id"}},{"kind":"Field","name":{"kind":"Name","value":"account_id"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"iso_currency_code"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"authorized_date"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"merchant_name"}},{"kind":"Field","name":{"kind":"Name","value":"pending"}},{"kind":"Field","name":{"kind":"Name","value":"payment_channel"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"}}]}}]}}]} as unknown as DocumentNode<TransactionsByAccountQuery, TransactionsByAccountQueryVariables>;
export const TransactionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Transaction"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"transaction"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"transaction_id"}},{"kind":"Field","name":{"kind":"Name","value":"account_id"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"iso_currency_code"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"authorized_date"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"merchant_name"}},{"kind":"Field","name":{"kind":"Name","value":"pending"}},{"kind":"Field","name":{"kind":"Name","value":"payment_channel"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}}]}}]}}]} as unknown as DocumentNode<TransactionQuery, TransactionQueryVariables>;