import type { MercuriusContext } from 'mercurius';
import { BudgetBucket } from '../models/budget-bucket';
import { Account } from '../models/account';
import { BalanceUpdate } from '../models/balance-update';
import { Transaction } from '../models/transaction';
import { SyncSource } from '../models/sync-source';
import { MonthlyPeriod } from '../models/monthly-period';
import { EmailSyncService } from '../services/email/sync.service';
import { ImapService } from '../services/email/imap.service';
import { getEmailParserService } from '../services/email/parser.service';

interface Context extends MercuriusContext {
  isAuthenticated: boolean;
  serviceClient?: string;
}

interface UpdateBudgetBucketInput {
  name?: string;
  monthly_limit?: number;
  color?: string;
}

interface AddAccountInput {
  name: string;
  bank: string;
  type: string;
  mask: string;
  iso_currency_code: string;
}

interface AddSyncSourceInput {
  account_id: number;
  name: string;
  type: string;
  email_address: string;
  imap_host: string;
  imap_port: number;
  imap_password: string;
  imap_folder?: string;
}

interface UpdateSyncSourceInput {
  name?: string;
  type?: string;
  email_address?: string;
  imap_host?: string;
  imap_port?: number;
  imap_password?: string;
  imap_folder?: string;
}

interface CreateMonthlyPeriodInput {
  month: string;
  projected_income: number;
  notes?: string | null;
}

interface UpdateMonthlyPeriodInput {
  projected_income?: number;
  actual_income?: number;
  status?: string;
  notes?: string | null;
}

export const resolvers = {
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
      { userId, account_id, limit, offset }: { userId: string; account_id: number; limit?: number; offset?: number },
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
      { userId, limit, offset }: { userId: string; limit?: number; offset?: number },
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
      return parserService.getAvailableBankTypes();
    },
  },

  Mutation: {
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

      if (!input.type || input.type.length < 1) {
        throw new Error('Type is required');
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
        type: input.type,
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
      if (input.email_address !== undefined && !input.email_address.includes('@')) {
        throw new Error('Valid email address is required');
      }

      if (input.imap_port !== undefined && (input.imap_port < 1 || input.imap_port > 65535)) {
        throw new Error('Valid IMAP port is required (1-65535)');
      }

      const updated = await SyncSource.update(id, userId, {
        name: input.name ?? undefined,
        type: input.type ?? undefined,
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
          console.error(`Failed to sync sync source ${source.id}:`, error);
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
      if (input.name !== undefined) {
        if (input.name.length < 1 || input.name.length > 50) {
          throw new Error('Name must be between 1 and 50 characters');
        }
      }

      if (input.monthly_limit !== undefined) {
        if (input.monthly_limit <= 0) {
          throw new Error('Monthly limit must be greater than 0');
        }
      }

      if (input.color !== undefined) {
        const validColorPattern =
          /^bg-(gray|red|orange|yellow|green|blue|indigo|purple|pink)-(50|100|200|300|400|500|600|700|800|900)$/;
        if (!validColorPattern.test(input.color)) {
          throw new Error('Invalid color format. Use Tailwind color classes like bg-blue-500');
        }
      }

      const updated = await BudgetBucket.update(userId, bucket_id, input);

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
      if (existing.isClosed && input.projected_income !== undefined) {
        throw new Error('Cannot modify projected income of a closed monthly period');
      }

      // Validate projected income if provided
      if (input.projected_income !== undefined && input.projected_income < 0) {
        throw new Error('Projected income must be a non-negative number');
      }

      // Validate actual income if provided
      if (input.actual_income !== undefined && input.actual_income < 0) {
        throw new Error('Actual income must be a non-negative number');
      }

      // Validate status if provided
      if (input.status !== undefined && !['open', 'closed'].includes(input.status)) {
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
  },
};
