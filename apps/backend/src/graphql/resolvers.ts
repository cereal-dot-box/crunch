import type { MercuriusContext } from 'mercurius';
import type {
  UpdateBudgetBucketInput,
  AddAccountInput,
  AddSyncSourceInput,
  UpdateSyncSourceInput,
  CreateMonthlyPeriodInput,
  UpdateMonthlyPeriodInput,
  UpdateSplitwiseSettingsInput,
  Resolvers,
  QueryTransactions_By_AccountArgs,
  QueryTransactionsArgs,
  MarkEmailProcessedInput,
  CreateTransactionFromEmailInput,
  CreateBalanceUpdateFromEmailInput,
  CreateDlqEntryInput,
} from './types.generated.js';
import { BudgetBucket } from '../models/budget-bucket';
import { Account } from '../models/account';
import { BalanceUpdate } from '../models/balance-update';
import { Transaction } from '../models/transaction';
import { SyncSource } from '../models/sync-source';
import { MonthlyPeriod } from '../models/monthly-period';
import { SplitwiseCredential } from '../models/splitwise-credential';
import { SplitwiseSetting } from '../models/splitwise-setting';
import { ProcessedEmail } from '../models/processed-emails';
import { EmailAlertDLQ } from '../models/email-alert-dlq';
import { oauthStateStore } from '../lib/oauth-state';
import { SplitwiseService } from '../services/splitwise.service';
import { EmailSyncService } from '../services/email/sync.service';
import { ImapService } from '../services/email/imap.service';
import { getEmailParserService } from '../services/email/parser.service';
import { loggers } from '../lib/logger';

const log = loggers.graphql;

export interface Context extends MercuriusContext {
  isAuthenticated: boolean;
  serviceClient?: string;
}

export const resolvers: Resolvers = {
  Query: {
    accounts: async (_parent: any, { userId }: { userId: string }, context: Context) => {
      if (!context.isAuthenticated) throw new Error('Unauthorized');
      const accounts = await Account.getByUserId(userId);

      // Fetch balances for each account
      const accountsWithBalances = await Promise.all(
        accounts.map(async (account) => {
          const availableBalance = await BalanceUpdate.getCurrent(account.id, userId, 'available_balance');
          const currentBalance = await BalanceUpdate.getCurrent(account.id, userId, 'current_balance');

          return {
            ...account.toJSON(),
            available_balance: availableBalance,
            current_balance: currentBalance,
          };
        })
      );

      return accountsWithBalances;
    },

    budget_buckets: async (_parent: any, { userId }: { userId: string }, context: Context) => {
      if (!context.isAuthenticated) throw new Error('Unauthorized');
      const buckets = await BudgetBucket.getByUserId(userId);

      return buckets.map((bucket) => bucket.toJSON());
    },

    budget_bucket: async (
      _parent: any,
      { userId, bucket_id }: { userId: string; bucket_id: string },
      context: Context
    ) => {
      if (!context.isAuthenticated) throw new Error('Unauthorized');
      const bucket = await BudgetBucket.get(userId, bucket_id);

      if (!bucket) {
        throw new Error('Budget bucket not found');
      }

      return bucket.toJSON();
    },

    monthly_periods: async (_parent: any, { userId }: { userId: string }, context: Context) => {
      if (!context.isAuthenticated) throw new Error('Unauthorized');
      const periods = await MonthlyPeriod.getByUserId(userId);
      return periods.map((period) => period.toJSON());
    },

    monthly_period: async (
      _parent: any,
      { userId, month }: { userId: string; month: string },
      context: Context
    ) => {
      if (!context.isAuthenticated) throw new Error('Unauthorized');
      const period = await MonthlyPeriod.getByMonth(userId, month);

      if (!period) {
        throw new Error('Monthly period not found');
      }

      return period.toJSON();
    },

    current_monthly_period: async (_parent: any, { userId }: { userId: string }, context: Context) => {
      if (!context.isAuthenticated) throw new Error('Unauthorized');
      const period = await MonthlyPeriod.getOpen(userId);
      return period ? period.toJSON() : null;
    },

    transactions_by_account: async (
      _parent: any,
      { userId, account_id, limit, offset }: QueryTransactions_By_AccountArgs,
      context: Context
    ) => {
      if (!context.isAuthenticated) throw new Error('Unauthorized');

      const transactions = await Transaction.getByAccountId(
        account_id,
        userId,
        limit || 50,
        offset || 0
      );

      const count = await Transaction.getCountByAccountId(account_id, userId);

      return {
        transactions: transactions.map((tx) => tx.toJSON()),
        total: count,
      };
    },

    transactions: async (
      _parent: any,
      { userId, limit, offset }: QueryTransactionsArgs,
      context: Context
    ) => {
      if (!context.isAuthenticated) throw new Error('Unauthorized');

      // Get transactions for the user
      const transactions = await Transaction.getByUserId(
        userId,
        limit || 50,
        offset || 0
      );

      const count = await Transaction.getCountByUserId(userId);

      return {
        transactions: transactions.map((tx) => tx.toJSON()),
        total: count,
      };
    },

    transaction: async (
      _parent: any,
      { userId, id }: { userId: string; id: number },
      context: Context
    ) => {
      if (!context.isAuthenticated) throw new Error('Unauthorized');
      const tx = await Transaction.getById(id, userId);
      if (!tx) throw new Error('Transaction not found');
      return tx.toJSON();
    },

    sync_sources: async (_parent: any, { userId }: { userId: string }, context: Context) => {
      if (!context.isAuthenticated) throw new Error('Unauthorized');
      const sources = await SyncSource.getByUserId(userId);

      // Get stats for each source
      return Promise.all(
        sources.map(async (source) => {
          const stats = await SyncSource.getWithStats(source.id);
          const data = source.toJSON();
          return {
            ...data,
            balance_count: stats?.balance_count || 0,
            transaction_count: stats?.transaction_count || 0,
          };
        })
      );
    },

    sync_sources_by_account: async (
      _parent: any,
      { userId, account_id }: { userId: string; account_id: number },
      context: Context
    ) => {
      if (!context.isAuthenticated) throw new Error('Unauthorized');
      const sources = await SyncSource.getByAccountId(account_id);

      // Get stats for each source
      return Promise.all(
        sources.map(async (source) => {
          const stats = await SyncSource.getWithStats(source.id);
          const data = source.toJSON();
          return {
            ...data,
            balance_count: stats?.balance_count || 0,
            transaction_count: stats?.transaction_count || 0,
          };
        })
      );
    },

    sync_source: async (
      _parent: any,
      { userId, id }: { userId: string; id: number },
      context: Context
    ) => {
      if (!context.isAuthenticated) throw new Error('Unauthorized');
      const source = await SyncSource.getById(id, userId);
      if (!source) throw new Error('Sync source not found');

      const stats = await SyncSource.getWithStats(id);
      const data = source.toJSON();
      return {
        ...data,
        balance_count: stats?.balance_count || 0,
        transaction_count: stats?.transaction_count || 0,
      };
    },

    available_bank_types: () => {
      const parserService = getEmailParserService();
      const bankTypes = parserService.getAvailableBankTypes();
      // Add Splitwise as a bank option
      return [...bankTypes, { bank: 'splitwise', types: ['splitwise'] }];
    },

    // Splitwise queries
    splitwise_authorize_url: async (
      _parent: any,
      { userId }: { userId: string },
      context: Context
    ) => {
      if (!context.isAuthenticated) throw new Error('Unauthorized');

      // Generate OAuth state using the state store
      const state = await oauthStateStore.generate(userId);

      // Build the real Splitwise authorize URL
      const splitwiseService = new SplitwiseService();
      const url = splitwiseService.getAuthorizationUrl(state);

      return { url };
    },

    splitwise_credential: async (
      _parent: any,
      { userId }: { userId: string },
      context: Context
    ) => {
      if (!context.isAuthenticated) throw new Error('Unauthorized');

      // Check if user has a Splitwise credential
      const credential = await SplitwiseCredential.getByUserId(userId);

      if (!credential) {
        return null;
      }

      // Return credential without exposing encrypted tokens
      return credential.toJSON();
    },

    splitwise_groups: async (
      _parent: any,
      { userId }: { userId: string },
      context: Context
    ) => {
      if (!context.isAuthenticated) throw new Error('Unauthorized');

      // Get user's Splitwise credential
      const credential = await SplitwiseCredential.getByUserId(userId);

      if (!credential) {
        throw new Error('No Splitwise credential found for user');
      }

      // Decrypt access token using instance method
      const accessToken = credential.getAccessToken();

      // Fetch groups from Splitwise API
      const splitwiseService = new SplitwiseService();
      const groups = await splitwiseService.getGroups(accessToken);

      return groups;
    },

    splitwise_settings: async (
      _parent: any,
      { userId }: { userId: string },
      context: Context
    ) => {
      if (!context.isAuthenticated) throw new Error('Unauthorized');

      // Get or create default settings for the user
      const setting = await SplitwiseSetting.getOrCreateDefault(userId);

      return setting.toJSON();
    },

    // Scheduler query: Get all active sync sources (for internal scheduler use)
    activeSyncSources: async () => {
      const { db } = await import('../lib/database');

      const sources = await db
        .selectFrom('SyncSource')
        .innerJoin('Account', 'Account.id', 'SyncSource.account_id')
        .select([
          'SyncSource.id',
          'SyncSource.name',
          'SyncSource.bank',
          'SyncSource.account_type as accountType',
          'SyncSource.account_id as accountId',
          'SyncSource.email_address as emailAddress',
          'SyncSource.imap_host as imapHost',
          'SyncSource.imap_port as imapPort',
          'SyncSource.imap_password_encrypted as imapPasswordEncrypted',
          'SyncSource.imap_folder as imapFolder',
          'SyncSource.last_processed_uid as lastProcessedUid',
          'Account.user_id as userId',
        ])
        .where('SyncSource.status', '=', 'active')
        .where('SyncSource.is_active', '=', 1)
        .where('Account.is_active', '=', 1)
        .execute();

      return sources;
    },

    // Worker queries (requires internal authentication)
    processedEmail: async (
      _parent: any,
      { syncSourceId, messageUid }: { syncSourceId: number; messageUid: string },
      context: Context
    ) => {
      if (!context.isAuthenticated) throw new Error('Unauthorized');

      const isProcessed = await ProcessedEmail.isProcessed(syncSourceId, messageUid);
      if (!isProcessed) return null;

      // Return minimal data - the worker only needs to know if it exists
      return {
        id: 0,
        messageUid,
      };
    },

    workerSyncSource: async (
      _parent: any,
      { id, userId }: { id: number; userId: string },
      context: Context
    ) => {
      if (!context.isAuthenticated) throw new Error('Unauthorized');

      const source = await SyncSource.getById(id, userId);
      if (!source) throw new Error('Sync source not found');

      return {
        id: source.id,
        name: source.name,
        bank: source.bank,
        accountType: source.accountType,
        accountId: source.accountId,
        emailAddress: source.emailAddress,
        imapHost: source.imapHost,
        imapPort: source.imapPort,
        imapPasswordEncrypted: source.imapPasswordEncrypted,
        imapFolder: source.imapFolder,
        lastProcessedUid: source.lastProcessedUid,
        userId,
      };
    },
  },

  Mutation: {
    initialize_default_buckets: async (
      _parent: any,
      { userId }: { userId: string },
      context: Context
    ) => {
      if (!context.isAuthenticated) throw new Error('Unauthorized');

      // Check if user already has buckets
      const existingBuckets = await BudgetBucket.getByUserId(userId);
      if (existingBuckets.length > 0) {
        return existingBuckets.map((bucket) => bucket.toJSON());
      }

      // Initialize default buckets
      const buckets = await BudgetBucket.initializeDefaults(userId);
      return buckets.map((bucket) => bucket.toJSON());
    },

    add_account: async (
      _parent: any,
      { userId, input }: { userId: string; input: AddAccountInput },
      context: Context
    ) => {
      if (!context.isAuthenticated) throw new Error('Unauthorized');

      // Validation
      if (!input.name || input.name.length < 1) {
        throw new Error('Account name is required');
      }

      if (!input.bank || input.bank.length < 1) {
        throw new Error('Bank is required');
      }

      if (!input.type || input.type.length < 1) {
        throw new Error('Account type is required');
      }

      if (!input.mask || input.mask.length < 1) {
        throw new Error('Account mask is required');
      }

      if (!input.iso_currency_code || input.iso_currency_code.length < 1) {
        throw new Error('Currency code is required');
      }

      const account = await Account.create({
        userId,
        name: input.name,
        bank: input.bank,
        type: input.type,
        mask: input.mask,
        isoCurrencyCode: input.iso_currency_code,
      });

      return {
        ...account,
        is_active: account.is_active === 1,
        updated_at: account.updated_at ?? '',
        available_balance: null,
        current_balance: null,
      };
    },

    add_sync_source: async (
      _parent: any,
      { userId, input }: { userId: string; input: AddSyncSourceInput },
      context: Context
    ) => {
      if (!context.isAuthenticated) throw new Error('Unauthorized');

      // Validation
      if (!input.name || input.name.length < 1) {
        throw new Error('Name is required');
      }

      if (!input.email_address || !input.email_address.includes('@')) {
        throw new Error('Valid email address is required');
      }

      if (!input.imap_host || input.imap_host.length < 1) {
        throw new Error('IMAP host is required');
      }

      if (!input.imap_port || input.imap_port < 1 || input.imap_port > 65535) {
        throw new Error('Valid IMAP port is required (1-65535)');
      }

      if (!input.imap_password || input.imap_password.length < 1) {
        throw new Error('IMAP password is required');
      }

      // Verify the account exists and belongs to the user
      const accounts = await Account.getByUserId(userId);
      const account = accounts.find((a) => a.id === input.account_id);
      if (!account) {
        throw new Error('Account not found');
      }

      const syncSource = await SyncSource.create({
        accountId: input.account_id,
        name: input.name,
        bank: account.bank ?? '',
        accountType: account.type ?? '',
        emailAddress: input.email_address,
        imapHost: input.imap_host,
        imapPort: input.imap_port,
        imapPasswordEncrypted: input.imap_password,
        imapFolder: input.imap_folder || 'INBOX',
      });

      return {
        ...syncSource,
        is_active: syncSource.is_active === 1,
        balance_count: 0,
        transaction_count: 0,
      };
    },

    update_sync_source: async (
      _parent: any,
      { userId, id, input }: { userId: string; id: number; input: UpdateSyncSourceInput },
      context: Context
    ) => {
      if (!context.isAuthenticated) throw new Error('Unauthorized');

      // Verify the sync source exists and belongs to the user
      const existing = await SyncSource.getById(id, userId);
      if (!existing) {
        throw new Error('Sync source not found');
      }

      // Validation for optional fields
      if (input.email_address != null && !input.email_address.includes('@')) {
        throw new Error('Valid email address is required');
      }

      if (input.imap_port != null && (input.imap_port < 1 || input.imap_port > 65535)) {
        throw new Error('Valid IMAP port is required (1-65535)');
      }

      const updated = await SyncSource.update(id, userId, {
        name: input.name ?? undefined,
        emailAddress: input.email_address ?? undefined,
        imapHost: input.imap_host ?? undefined,
        imapPort: input.imap_port ?? undefined,
        imapPassword: input.imap_password ?? undefined,
        imapFolder: input.imap_folder ?? undefined,
      });

      if (!updated) {
        throw new Error('Failed to update sync source');
      }

      const stats = await SyncSource.getWithStats(id);
      return {
        ...updated.toJSON(),
        balance_count: stats?.balance_count || 0,
        transaction_count: stats?.transaction_count || 0,
      };
    },

    sync_accounts: async (_parent: any, { userId }: { userId: string }, context: Context) => {
      if (!context.isAuthenticated) throw new Error('Unauthorized');

      const syncService = new EmailSyncService();

      // Get all active sync sources for this user
      const syncSources = await SyncSource.getActiveByUserId(userId);

      // Sync each sync source
      for (const source of syncSources) {
        try {
          await syncService.syncSyncSource(source.id, userId);
        } catch (error) {
          log.error({ err: error, syncSourceId: source.id }, 'Failed to sync sync source');
          // Continue with other sources even if one fails
        }
      }

      return true;
    },

    deactivate_account: async (
      _parent: any,
      { userId, account_id }: { userId: string; account_id: number },
      context: Context
    ) => {
      if (!context.isAuthenticated) throw new Error('Unauthorized');
      await Account.deactivate(account_id, userId);
      return true;
    },

    update_budget_bucket: async (
      _parent: any,
      {
        userId,
        bucket_id,
        input,
      }: {
        userId: string;
        bucket_id: string;
        input: UpdateBudgetBucketInput;
      },
      context: Context
    ) => {
      if (!context.isAuthenticated) throw new Error('Unauthorized');

      // Validation
      if (input.name != null) {
        if (input.name.length < 1 || input.name.length > 50) {
          throw new Error('Name must be between 1 and 50 characters');
        }
      }

      if (input.monthly_limit != null) {
        if (input.monthly_limit <= 0) {
          throw new Error('Monthly limit must be greater than 0');
        }
      }

      if (input.color != null) {
        const validColorPattern =
          /^bg-(gray|red|orange|yellow|green|blue|indigo|purple|pink)-(50|100|200|300|400|500|600|700|800|900)$/;
        if (!validColorPattern.test(input.color)) {
          throw new Error('Invalid color format. Use Tailwind color classes like bg-blue-500');
        }
      }

      const updated = await BudgetBucket.update(userId, bucket_id, {
        name: input.name ?? undefined,
        monthly_limit: input.monthly_limit ?? undefined,
        color: input.color ?? undefined,
      });

      if (!updated) {
        throw new Error('Budget bucket not found');
      }

      return updated.toJSON();
    },

    create_monthly_period: async (
      _parent: any,
      { userId, input }: { userId: string; input: CreateMonthlyPeriodInput },
      context: Context
    ) => {
      if (!context.isAuthenticated) throw new Error('Unauthorized');

      // Validation
      if (!input.month || !input.month.match(/^\d{4}-(0[1-9]|1[0-2])$/)) {
        throw new Error('Month must be in YYYY-MM format');
      }

      if (input.projected_income === undefined || input.projected_income < 0) {
        throw new Error('Projected income must be a non-negative number');
      }

      // Check if period already exists
      const existing = await MonthlyPeriod.getByMonth(userId, input.month);
      if (existing) {
        throw new Error('Monthly period for this month already exists');
      }

      const period = await MonthlyPeriod.create({
        userId,
        month: input.month,
        projectedIncome: input.projected_income,
        notes: input.notes ?? null,
      });

      return period;
    },

    update_monthly_period: async (
      _parent: any,
      { userId, id, input }: { userId: string; id: number; input: UpdateMonthlyPeriodInput },
      context: Context
    ) => {
      if (!context.isAuthenticated) throw new Error('Unauthorized');

      // Get existing period to check status
      const existing = await MonthlyPeriod.getById(id, userId);
      if (!existing) {
        throw new Error('Monthly period not found');
      }

      // Validation: Can't modify projected_income of closed periods
      if (existing.isClosed && input.projected_income != null) {
        throw new Error('Cannot modify projected income of a closed monthly period');
      }

      // Validate projected income if provided
      if (input.projected_income != null && input.projected_income < 0) {
        throw new Error('Projected income must be a non-negative number');
      }

      // Validate actual income if provided
      if (input.actual_income != null && input.actual_income < 0) {
        throw new Error('Actual income must be a non-negative number');
      }

      // Validate status if provided
      if (input.status != null && !['open', 'closed'].includes(input.status)) {
        throw new Error('Status must be either "open" or "closed"');
      }

      const updated = await MonthlyPeriod.update(id, userId, {
        projectedIncome: input.projected_income ?? undefined,
        actualIncome: input.actual_income ?? undefined,
        status: input.status ?? undefined,
        notes: input.notes ?? undefined,
      });

      if (!updated) {
        throw new Error('Failed to update monthly period');
      }

      return updated.toJSON();
    },

    close_monthly_period: async (
      _parent: any,
      { userId, id }: { userId: string; id: number },
      context: Context
    ) => {
      if (!context.isAuthenticated) throw new Error('Unauthorized');

      const existing = await MonthlyPeriod.getById(id, userId);
      if (!existing) {
        throw new Error('Monthly period not found');
      }

      if (existing.isClosed) {
        throw new Error('Monthly period is already closed');
      }

      const closed = await MonthlyPeriod.close(id, userId);

      if (!closed) {
        throw new Error('Failed to close monthly period');
      }

      return closed.toJSON();
    },

    delete_monthly_period: async (
      _parent: any,
      { userId, id }: { userId: string; id: number },
      context: Context
    ) => {
      if (!context.isAuthenticated) throw new Error('Unauthorized');

      const existing = await MonthlyPeriod.getById(id, userId);
      if (!existing) {
        throw new Error('Monthly period not found');
      }

      // Prevent deleting closed periods
      if (existing.isClosed) {
        throw new Error('Cannot delete a closed monthly period');
      }

      await MonthlyPeriod.delete(id, userId);
      return true;
    },

    delete_sync_source: async (
      _parent: any,
      { userId, id }: { userId: string; id: number },
      context: Context
    ) => {
      if (!context.isAuthenticated) throw new Error('Unauthorized');

      // Delete the sync source (cascade will handle related data)
      await SyncSource.delete(id, userId);

      return true;
    },

    test_sync_source_connection: async (
      _parent: any,
      { userId, id }: { userId: string; id: number },
      context: Context
    ) => {
      if (!context.isAuthenticated) throw new Error('Unauthorized');

      const source = await SyncSource.getById(id, userId);
      if (!source) throw new Error('Sync source not found');

      const imapService = new ImapService(source.toJSON());
      const success = await imapService.testConnection();

      // Update source status
      await SyncSource.updateStatus(
        id,
        success ? 'active' : 'error'
      );

      return {
        success,
        error_message: success
          ? null
          : 'Connection failed. Please check credentials.',
      };
    },

    sync_sync_source: async (
      _parent: any,
      { userId, id }: { userId: string; id: number },
      context: Context
    ) => {
      if (!context.isAuthenticated) throw new Error('Unauthorized');

      const syncService = new EmailSyncService();
      const result = await syncService.syncAndProcessSyncSource(id, userId);

      return {
        timestamp: new Date().toISOString(),
        emails_fetched: result.emailsFetched,
        jobs_enqueued: result.jobsEnqueued,
        errors: result.errors,
        duration: result.duration,
      };
    },

    // Splitwise mutations
    splitwise_complete_oauth: async (
      _parent: any,
      { userId, code, state }: { userId: string; code: string; state: string },
      context: Context
    ) => {
      if (!context.isAuthenticated) throw new Error('Unauthorized');

      // Validate OAuth state
      const stateValidation = await oauthStateStore.validate(state);
      if (!stateValidation.valid) {
        throw new Error('Invalid or expired OAuth state');
      }

      // Verify the state belongs to the current user
      if (stateValidation.userId !== userId) {
        throw new Error('OAuth state user mismatch');
      }

      // Exchange authorization code for tokens
      const splitwiseService = new SplitwiseService();
      const tokenResponse = await splitwiseService.exchangeCodeForToken(code);

      // Get the Splitwise user ID
      const splitwiseUser = await splitwiseService.getCurrentUser(tokenResponse.access_token);

      // Calculate token expiration
      const expiresAt = splitwiseService.calculateTokenExpiration(tokenResponse.expires_in);

      // Check if credential already exists and update, or create new
      const existing = await SplitwiseCredential.getByUserId(userId);

      if (existing) {
        const updated = await SplitwiseCredential.update(userId, {
          accessToken: tokenResponse.access_token,
          refreshToken: tokenResponse.refresh_token,
          expiresAt,
        });
        return updated!.toJSON();
      }

      const credential = await SplitwiseCredential.create({
        userId,
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token,
        tokenType: tokenResponse.token_type,
        expiresAt,
        splitwiseUserId: splitwiseUser.id.toString(),
      });

      log.info({ userId, splitwiseUserId: splitwiseUser.id }, 'Splitwise OAuth completed successfully');

      return credential.toJSON();
    },

    splitwise_disconnect: async (
      _parent: any,
      { userId }: { userId: string },
      context: Context
    ) => {
      if (!context.isAuthenticated) throw new Error('Unauthorized');

      await SplitwiseCredential.delete(userId);
      return true;
    },

    splitwise_update_settings: async (
      _parent: any,
      { userId, input }: { userId: string; input: UpdateSplitwiseSettingsInput },
      context: Context
    ) => {
      if (!context.isAuthenticated) throw new Error('Unauthorized');

      // Validate input
      if (input.included_group_ids !== undefined) {
        if (!Array.isArray(input.included_group_ids)) {
          throw new Error('included_group_ids must be an array');
        }
        // Verify all group IDs are numbers
        if (!input.included_group_ids.every((id) => typeof id === 'number' && Number.isInteger(id))) {
          throw new Error('included_group_ids must contain only integers');
        }
      }

      if (input.auto_sync_enabled !== undefined && typeof input.auto_sync_enabled !== 'boolean') {
        throw new Error('auto_sync_enabled must be a boolean');
      }

      // Upsert settings (create if doesn't exist, update if it does)
      const setting = await SplitwiseSetting.upsert(userId, {
        includedGroupIds: input.included_group_ids,
        autoSyncEnabled: input.auto_sync_enabled,
      });

      return setting.toJSON();
    },

    // Worker mutations (requires internal authentication)
    markEmailProcessed: async (
      _parent: any,
      { input }: { input: MarkEmailProcessedInput },
      context: Context
    ) => {
      if (!context.isAuthenticated) throw new Error('Unauthorized');

      const processedEmail = await ProcessedEmail.mark({
        userId: input.userId,
        syncSourceId: input.syncSourceId,
        messageUid: input.messageUid,
      });

      return {
        id: processedEmail.id,
        messageUid: processedEmail.messageUid,
      };
    },

    createTransactionFromEmail: async (
      _parent: any,
      { input }: { input: CreateTransactionFromEmailInput },
      context: Context
    ) => {
      if (!context.isAuthenticated) throw new Error('Unauthorized');

      const transaction = await Transaction.create({
        userId: input.userId,
        accountId: input.accountId,
        syncSourceId: input.syncSourceId,
        processedEmailId: input.processedEmailId,
        amount: input.amount,
        transactionDate: input.transactionDate,
        name: input.name,
        merchantName: input.merchantName ?? undefined,
      });

      return {
        id: transaction.id,
        transaction_id: String(transaction.id),
        account_id: transaction.account_id,
        amount: transaction.amount,
        iso_currency_code: transaction.iso_currency_code,
        date: transaction.transaction_date,
        authorized_date: transaction.authorized_date,
        name: transaction.name,
        merchant_name: transaction.merchant_name,
        pending: transaction.pending === 1,
        payment_channel: transaction.payment_channel,
        created_at: transaction.created_at,
        updated_at: transaction.updated_at,
      };
    },

    createBalanceUpdateFromEmail: async (
      _parent: any,
      { input }: { input: CreateBalanceUpdateFromEmailInput },
      context: Context
    ) => {
      if (!context.isAuthenticated) throw new Error('Unauthorized');

      await BalanceUpdate.create({
        userId: input.userId,
        accountId: input.accountId,
        syncSourceId: input.syncSourceId,
        processedEmailId: input.processedEmailId,
        balanceType: input.balanceType as 'available_balance' | 'current_balance',
        newBalance: input.newBalance,
        updateSource: input.updateSource,
        sourceDetail: input.sourceDetail,
        updateDate: input.updateDate,
      });

      return true;
    },

    createDLQEntry: async (
      _parent: any,
      { input }: { input: CreateDlqEntryInput },
      context: Context
    ) => {
      if (!context.isAuthenticated) throw new Error('Unauthorized');

      await EmailAlertDLQ.create({
        userId: input.userId,
        syncSourceId: input.syncSourceId,
        messageUid: input.messageUid,
        subject: input.subject,
        fromAddress: input.fromAddress,
        date: input.date,
        bodyText: input.bodyText,
        bodyHtml: input.bodyHtml ?? undefined,
        errorMessage: input.errorMessage,
        errorType: input.errorType as any,
        errorStack: input.errorStack ?? undefined,
      });

      return true;
    },
  },
};
