import { GraphQLResolveInfo } from 'graphql';
import { Context } from '../graphql/resolvers';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
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

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = Record<PropertyKey, never>, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;





/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  Account: ResolverTypeWrapper<Account>;
  AddAccountInput: AddAccountInput;
  AddSyncSourceInput: AddSyncSourceInput;
  AvailableBankType: ResolverTypeWrapper<AvailableBankType>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  BudgetBucket: ResolverTypeWrapper<BudgetBucket>;
  CreateMonthlyPeriodInput: CreateMonthlyPeriodInput;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  MonthlyPeriod: ResolverTypeWrapper<MonthlyPeriod>;
  Mutation: ResolverTypeWrapper<Record<PropertyKey, never>>;
  Query: ResolverTypeWrapper<Record<PropertyKey, never>>;
  SplitwiseAuthorizeUrl: ResolverTypeWrapper<SplitwiseAuthorizeUrl>;
  SplitwiseCredential: ResolverTypeWrapper<SplitwiseCredential>;
  SplitwiseGroup: ResolverTypeWrapper<SplitwiseGroup>;
  SplitwiseGroupMember: ResolverTypeWrapper<SplitwiseGroupMember>;
  SplitwiseSetting: ResolverTypeWrapper<SplitwiseSetting>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  SyncResult: ResolverTypeWrapper<SyncResult>;
  SyncSource: ResolverTypeWrapper<SyncSource>;
  TestConnectionResult: ResolverTypeWrapper<TestConnectionResult>;
  Transaction: ResolverTypeWrapper<Transaction>;
  TransactionListResponse: ResolverTypeWrapper<TransactionListResponse>;
  UpdateBudgetBucketInput: UpdateBudgetBucketInput;
  UpdateMonthlyPeriodInput: UpdateMonthlyPeriodInput;
  UpdateSplitwiseSettingsInput: UpdateSplitwiseSettingsInput;
  UpdateSyncSourceInput: UpdateSyncSourceInput;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Account: Account;
  AddAccountInput: AddAccountInput;
  AddSyncSourceInput: AddSyncSourceInput;
  AvailableBankType: AvailableBankType;
  Boolean: Scalars['Boolean']['output'];
  BudgetBucket: BudgetBucket;
  CreateMonthlyPeriodInput: CreateMonthlyPeriodInput;
  Float: Scalars['Float']['output'];
  ID: Scalars['ID']['output'];
  Int: Scalars['Int']['output'];
  MonthlyPeriod: MonthlyPeriod;
  Mutation: Record<PropertyKey, never>;
  Query: Record<PropertyKey, never>;
  SplitwiseAuthorizeUrl: SplitwiseAuthorizeUrl;
  SplitwiseCredential: SplitwiseCredential;
  SplitwiseGroup: SplitwiseGroup;
  SplitwiseGroupMember: SplitwiseGroupMember;
  SplitwiseSetting: SplitwiseSetting;
  String: Scalars['String']['output'];
  SyncResult: SyncResult;
  SyncSource: SyncSource;
  TestConnectionResult: TestConnectionResult;
  Transaction: Transaction;
  TransactionListResponse: TransactionListResponse;
  UpdateBudgetBucketInput: UpdateBudgetBucketInput;
  UpdateMonthlyPeriodInput: UpdateMonthlyPeriodInput;
  UpdateSplitwiseSettingsInput: UpdateSplitwiseSettingsInput;
  UpdateSyncSourceInput: UpdateSyncSourceInput;
}>;

export type AccountResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Account'] = ResolversParentTypes['Account']> = ResolversObject<{
  available_balance?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  bank?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  created_at?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  current_balance?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  is_active?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  iso_currency_code?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  mask?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updated_at?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type AvailableBankTypeResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AvailableBankType'] = ResolversParentTypes['AvailableBankType']> = ResolversObject<{
  bank?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  types?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type BudgetBucketResolvers<ContextType = Context, ParentType extends ResolversParentTypes['BudgetBucket'] = ResolversParentTypes['BudgetBucket']> = ResolversObject<{
  bucket_id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  color?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  created_at?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  is_active?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  monthly_limit?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updated_at?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type MonthlyPeriodResolvers<ContextType = Context, ParentType extends ResolversParentTypes['MonthlyPeriod'] = ResolversParentTypes['MonthlyPeriod']> = ResolversObject<{
  actual_income?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  created_at?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  is_closed?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  is_open?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  month?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  notes?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  projected_income?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updated_at?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  user_id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
}>;

export type MutationResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  add_account?: Resolver<ResolversTypes['Account'], ParentType, ContextType, RequireFields<MutationAdd_AccountArgs, 'input' | 'userId'>>;
  add_sync_source?: Resolver<ResolversTypes['SyncSource'], ParentType, ContextType, RequireFields<MutationAdd_Sync_SourceArgs, 'input' | 'userId'>>;
  close_monthly_period?: Resolver<ResolversTypes['MonthlyPeriod'], ParentType, ContextType, RequireFields<MutationClose_Monthly_PeriodArgs, 'id' | 'userId'>>;
  create_monthly_period?: Resolver<ResolversTypes['MonthlyPeriod'], ParentType, ContextType, RequireFields<MutationCreate_Monthly_PeriodArgs, 'input' | 'userId'>>;
  deactivate_account?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeactivate_AccountArgs, 'account_id' | 'userId'>>;
  delete_monthly_period?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDelete_Monthly_PeriodArgs, 'id' | 'userId'>>;
  delete_sync_source?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDelete_Sync_SourceArgs, 'id' | 'userId'>>;
  initialize_default_buckets?: Resolver<Array<ResolversTypes['BudgetBucket']>, ParentType, ContextType, RequireFields<MutationInitialize_Default_BucketsArgs, 'userId'>>;
  splitwise_complete_oauth?: Resolver<ResolversTypes['SplitwiseCredential'], ParentType, ContextType, RequireFields<MutationSplitwise_Complete_OauthArgs, 'code' | 'state' | 'userId'>>;
  splitwise_disconnect?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationSplitwise_DisconnectArgs, 'userId'>>;
  splitwise_update_settings?: Resolver<ResolversTypes['SplitwiseSetting'], ParentType, ContextType, RequireFields<MutationSplitwise_Update_SettingsArgs, 'input' | 'userId'>>;
  sync_accounts?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationSync_AccountsArgs, 'userId'>>;
  sync_sync_source?: Resolver<ResolversTypes['SyncResult'], ParentType, ContextType, RequireFields<MutationSync_Sync_SourceArgs, 'id' | 'userId'>>;
  test_sync_source_connection?: Resolver<ResolversTypes['TestConnectionResult'], ParentType, ContextType, RequireFields<MutationTest_Sync_Source_ConnectionArgs, 'id' | 'userId'>>;
  update_budget_bucket?: Resolver<ResolversTypes['BudgetBucket'], ParentType, ContextType, RequireFields<MutationUpdate_Budget_BucketArgs, 'bucket_id' | 'input' | 'userId'>>;
  update_monthly_period?: Resolver<ResolversTypes['MonthlyPeriod'], ParentType, ContextType, RequireFields<MutationUpdate_Monthly_PeriodArgs, 'id' | 'input' | 'userId'>>;
  update_sync_source?: Resolver<ResolversTypes['SyncSource'], ParentType, ContextType, RequireFields<MutationUpdate_Sync_SourceArgs, 'id' | 'input' | 'userId'>>;
}>;

export type QueryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  accounts?: Resolver<Array<ResolversTypes['Account']>, ParentType, ContextType, RequireFields<QueryAccountsArgs, 'userId'>>;
  available_bank_types?: Resolver<Array<ResolversTypes['AvailableBankType']>, ParentType, ContextType>;
  budget_bucket?: Resolver<Maybe<ResolversTypes['BudgetBucket']>, ParentType, ContextType, RequireFields<QueryBudget_BucketArgs, 'bucket_id' | 'userId'>>;
  budget_buckets?: Resolver<Array<ResolversTypes['BudgetBucket']>, ParentType, ContextType, RequireFields<QueryBudget_BucketsArgs, 'userId'>>;
  current_monthly_period?: Resolver<Maybe<ResolversTypes['MonthlyPeriod']>, ParentType, ContextType, RequireFields<QueryCurrent_Monthly_PeriodArgs, 'userId'>>;
  monthly_period?: Resolver<Maybe<ResolversTypes['MonthlyPeriod']>, ParentType, ContextType, RequireFields<QueryMonthly_PeriodArgs, 'month' | 'userId'>>;
  monthly_periods?: Resolver<Array<ResolversTypes['MonthlyPeriod']>, ParentType, ContextType, RequireFields<QueryMonthly_PeriodsArgs, 'userId'>>;
  splitwise_authorize_url?: Resolver<ResolversTypes['SplitwiseAuthorizeUrl'], ParentType, ContextType, RequireFields<QuerySplitwise_Authorize_UrlArgs, 'userId'>>;
  splitwise_credential?: Resolver<Maybe<ResolversTypes['SplitwiseCredential']>, ParentType, ContextType, RequireFields<QuerySplitwise_CredentialArgs, 'userId'>>;
  splitwise_groups?: Resolver<Array<ResolversTypes['SplitwiseGroup']>, ParentType, ContextType, RequireFields<QuerySplitwise_GroupsArgs, 'userId'>>;
  splitwise_settings?: Resolver<ResolversTypes['SplitwiseSetting'], ParentType, ContextType, RequireFields<QuerySplitwise_SettingsArgs, 'userId'>>;
  sync_source?: Resolver<Maybe<ResolversTypes['SyncSource']>, ParentType, ContextType, RequireFields<QuerySync_SourceArgs, 'id' | 'userId'>>;
  sync_sources?: Resolver<Array<ResolversTypes['SyncSource']>, ParentType, ContextType, RequireFields<QuerySync_SourcesArgs, 'userId'>>;
  sync_sources_by_account?: Resolver<Array<ResolversTypes['SyncSource']>, ParentType, ContextType, RequireFields<QuerySync_Sources_By_AccountArgs, 'account_id' | 'userId'>>;
  transaction?: Resolver<Maybe<ResolversTypes['Transaction']>, ParentType, ContextType, RequireFields<QueryTransactionArgs, 'id' | 'userId'>>;
  transactions?: Resolver<ResolversTypes['TransactionListResponse'], ParentType, ContextType, RequireFields<QueryTransactionsArgs, 'userId'>>;
  transactions_by_account?: Resolver<ResolversTypes['TransactionListResponse'], ParentType, ContextType, RequireFields<QueryTransactions_By_AccountArgs, 'account_id' | 'userId'>>;
}>;

export type SplitwiseAuthorizeUrlResolvers<ContextType = Context, ParentType extends ResolversParentTypes['SplitwiseAuthorizeUrl'] = ResolversParentTypes['SplitwiseAuthorizeUrl']> = ResolversObject<{
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type SplitwiseCredentialResolvers<ContextType = Context, ParentType extends ResolversParentTypes['SplitwiseCredential'] = ResolversParentTypes['SplitwiseCredential']> = ResolversObject<{
  created_at?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  splitwise_user_id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  updated_at?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  user_id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
}>;

export type SplitwiseGroupResolvers<ContextType = Context, ParentType extends ResolversParentTypes['SplitwiseGroup'] = ResolversParentTypes['SplitwiseGroup']> = ResolversObject<{
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  members?: Resolver<Array<ResolversTypes['SplitwiseGroupMember']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updated_at?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type SplitwiseGroupMemberResolvers<ContextType = Context, ParentType extends ResolversParentTypes['SplitwiseGroupMember'] = ResolversParentTypes['SplitwiseGroupMember']> = ResolversObject<{
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  first_name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  last_name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type SplitwiseSettingResolvers<ContextType = Context, ParentType extends ResolversParentTypes['SplitwiseSetting'] = ResolversParentTypes['SplitwiseSetting']> = ResolversObject<{
  auto_sync_enabled?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  created_at?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  included_group_ids?: Resolver<Array<ResolversTypes['Int']>, ParentType, ContextType>;
  updated_at?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  user_id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
}>;

export type SyncResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['SyncResult'] = ResolversParentTypes['SyncResult']> = ResolversObject<{
  duration?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  emails_fetched?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  errors?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  jobs_enqueued?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  timestamp?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type SyncSourceResolvers<ContextType = Context, ParentType extends ResolversParentTypes['SyncSource'] = ResolversParentTypes['SyncSource']> = ResolversObject<{
  account_id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  balance_count?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  created_at?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  email_address?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  imap_folder?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  imap_host?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  imap_port?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  is_active?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  last_processed_uid?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  last_synced_at?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  transaction_count?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type TestConnectionResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TestConnectionResult'] = ResolversParentTypes['TestConnectionResult']> = ResolversObject<{
  error_message?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
}>;

export type TransactionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Transaction'] = ResolversParentTypes['Transaction']> = ResolversObject<{
  account_id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  amount?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  authorized_date?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  created_at?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  date?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  iso_currency_code?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  merchant_name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  payment_channel?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  pending?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  transaction_id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updated_at?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type TransactionListResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TransactionListResponse'] = ResolversParentTypes['TransactionListResponse']> = ResolversObject<{
  total?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  transactions?: Resolver<Array<ResolversTypes['Transaction']>, ParentType, ContextType>;
}>;

export type Resolvers<ContextType = Context> = ResolversObject<{
  Account?: AccountResolvers<ContextType>;
  AvailableBankType?: AvailableBankTypeResolvers<ContextType>;
  BudgetBucket?: BudgetBucketResolvers<ContextType>;
  MonthlyPeriod?: MonthlyPeriodResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  SplitwiseAuthorizeUrl?: SplitwiseAuthorizeUrlResolvers<ContextType>;
  SplitwiseCredential?: SplitwiseCredentialResolvers<ContextType>;
  SplitwiseGroup?: SplitwiseGroupResolvers<ContextType>;
  SplitwiseGroupMember?: SplitwiseGroupMemberResolvers<ContextType>;
  SplitwiseSetting?: SplitwiseSettingResolvers<ContextType>;
  SyncResult?: SyncResultResolvers<ContextType>;
  SyncSource?: SyncSourceResolvers<ContextType>;
  TestConnectionResult?: TestConnectionResultResolvers<ContextType>;
  Transaction?: TransactionResolvers<ContextType>;
  TransactionListResponse?: TransactionListResponseResolvers<ContextType>;
}>;

