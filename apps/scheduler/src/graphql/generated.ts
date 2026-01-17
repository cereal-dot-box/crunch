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
  bank: Scalars['String']['output'];
  types: Array<Scalars['String']['output']>;
};

export type BudgetBucket = {
  bucket_id: Scalars['String']['output'];
  color: Scalars['String']['output'];
  created_at: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  is_active: Scalars['Boolean']['output'];
  monthly_limit: Scalars['Float']['output'];
  name: Scalars['String']['output'];
  updated_at: Scalars['String']['output'];
};

export type CreateBalanceUpdateFromEmailInput = {
  accountId: Scalars['Int']['input'];
  balanceType: Scalars['String']['input'];
  newBalance: Scalars['Float']['input'];
  processedEmailId: Scalars['Int']['input'];
  sourceDetail: Scalars['String']['input'];
  syncSourceId: Scalars['Int']['input'];
  updateDate: Scalars['String']['input'];
  updateSource: Scalars['String']['input'];
  userId: Scalars['ID']['input'];
};

export type CreateDlqEntryInput = {
  bodyHtml?: InputMaybe<Scalars['String']['input']>;
  bodyText: Scalars['String']['input'];
  date: Scalars['String']['input'];
  errorMessage: Scalars['String']['input'];
  errorStack?: InputMaybe<Scalars['String']['input']>;
  errorType: Scalars['String']['input'];
  fromAddress: Scalars['String']['input'];
  messageUid: Scalars['String']['input'];
  subject: Scalars['String']['input'];
  syncSourceId: Scalars['Int']['input'];
  userId: Scalars['ID']['input'];
};

export type CreateMonthlyPeriodInput = {
  month: Scalars['String']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  projected_income: Scalars['Float']['input'];
};

export type CreateTransactionFromEmailInput = {
  accountId: Scalars['Int']['input'];
  amount: Scalars['Float']['input'];
  merchantName?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  processedEmailId: Scalars['Int']['input'];
  syncSourceId: Scalars['Int']['input'];
  transactionDate: Scalars['String']['input'];
  userId: Scalars['ID']['input'];
};

export type MarkEmailProcessedInput = {
  messageUid: Scalars['String']['input'];
  syncSourceId: Scalars['Int']['input'];
  userId: Scalars['ID']['input'];
};

export type MonthlyPeriod = {
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
  add_account: Account;
  add_sync_source: SyncSource;
  close_monthly_period: MonthlyPeriod;
  createBalanceUpdateFromEmail: Scalars['Boolean']['output'];
  createDLQEntry: Scalars['Boolean']['output'];
  createTransactionFromEmail: Transaction;
  create_monthly_period: MonthlyPeriod;
  deactivate_account: Scalars['Boolean']['output'];
  delete_monthly_period: Scalars['Boolean']['output'];
  delete_sync_source: Scalars['Boolean']['output'];
  initialize_default_buckets: Array<BudgetBucket>;
  markEmailProcessed: ProcessedEmail;
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


export type MutationCreateBalanceUpdateFromEmailArgs = {
  input: CreateBalanceUpdateFromEmailInput;
};


export type MutationCreateDlqEntryArgs = {
  input: CreateDlqEntryInput;
};


export type MutationCreateTransactionFromEmailArgs = {
  input: CreateTransactionFromEmailInput;
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


export type MutationMarkEmailProcessedArgs = {
  input: MarkEmailProcessedInput;
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

export type ProcessedEmail = {
  id: Scalars['Int']['output'];
  messageUid: Scalars['String']['output'];
};

export type Query = {
  accounts: Array<Account>;
  activeSyncSources: Array<SchedulerSyncSource>;
  available_bank_types: Array<AvailableBankType>;
  budget_bucket?: Maybe<BudgetBucket>;
  budget_buckets: Array<BudgetBucket>;
  current_monthly_period?: Maybe<MonthlyPeriod>;
  monthly_period?: Maybe<MonthlyPeriod>;
  monthly_periods: Array<MonthlyPeriod>;
  processedEmail?: Maybe<ProcessedEmail>;
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
  workerSyncSource?: Maybe<SchedulerSyncSource>;
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


export type QueryProcessedEmailArgs = {
  messageUid: Scalars['String']['input'];
  syncSourceId: Scalars['Int']['input'];
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


export type QueryWorkerSyncSourceArgs = {
  id: Scalars['Int']['input'];
  userId: Scalars['ID']['input'];
};

export type SchedulerSyncSource = {
  accountId: Scalars['Int']['output'];
  accountType?: Maybe<Scalars['String']['output']>;
  bank?: Maybe<Scalars['String']['output']>;
  emailAddress: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  imapFolder: Scalars['String']['output'];
  imapHost: Scalars['String']['output'];
  imapPasswordEncrypted: Scalars['String']['output'];
  imapPort: Scalars['Int']['output'];
  lastProcessedUid?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  userId: Scalars['ID']['output'];
};

export type SplitwiseAuthorizeUrl = {
  url: Scalars['String']['output'];
};

export type SplitwiseCredential = {
  created_at: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  splitwise_user_id: Scalars['ID']['output'];
  updated_at: Scalars['String']['output'];
  user_id: Scalars['ID']['output'];
};

export type SplitwiseGroup = {
  id: Scalars['Int']['output'];
  members: Array<SplitwiseGroupMember>;
  name: Scalars['String']['output'];
  updated_at: Scalars['String']['output'];
};

export type SplitwiseGroupMember = {
  email: Scalars['String']['output'];
  first_name: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  last_name?: Maybe<Scalars['String']['output']>;
};

export type SplitwiseSetting = {
  auto_sync_enabled: Scalars['Boolean']['output'];
  created_at: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  included_group_ids: Array<Scalars['Int']['output']>;
  updated_at: Scalars['String']['output'];
  user_id: Scalars['ID']['output'];
};

export type SyncResult = {
  duration: Scalars['Int']['output'];
  emails_fetched: Scalars['Int']['output'];
  errors: Scalars['Int']['output'];
  jobs_enqueued: Scalars['Int']['output'];
  timestamp: Scalars['String']['output'];
};

export type SyncSource = {
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
  error_message?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type Transaction = {
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

export type GetActiveSyncSourcesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetActiveSyncSourcesQuery = { activeSyncSources: Array<{ id: number, name: string, bank?: string | null, accountType?: string | null, accountId: number, emailAddress: string, imapHost: string, imapPort: number, imapPasswordEncrypted: string, imapFolder: string, lastProcessedUid?: string | null, userId: string }> };

export type GetSyncSourceQueryVariables = Exact<{
  id: Scalars['Int']['input'];
  userId: Scalars['ID']['input'];
}>;


export type GetSyncSourceQuery = { workerSyncSource?: { id: number, name: string, bank?: string | null, accountType?: string | null, accountId: number, emailAddress: string, imapHost: string, imapPort: number, imapPasswordEncrypted: string, imapFolder: string, lastProcessedUid?: string | null, userId: string } | null };
