// Auto-generated index file for MCP tools
// Source: http://localhost:3000/mcp/schema
import { getMcpClient } from "./client.js";
import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { accountsToolWithClient } from "./accounts.js";
import { budget_bucketsToolWithClient } from "./budget_buckets.js";
import { budget_bucketToolWithClient } from "./budget_bucket.js";
import { monthly_periodsToolWithClient } from "./monthly_periods.js";
import { monthly_periodToolWithClient } from "./monthly_period.js";
import { current_monthly_periodToolWithClient } from "./current_monthly_period.js";
import { transactions_by_accountToolWithClient } from "./transactions_by_account.js";
import { transactionsToolWithClient } from "./transactions.js";
import { transactionToolWithClient } from "./transaction.js";
import { sync_sourcesToolWithClient } from "./sync_sources.js";
import { sync_sources_by_accountToolWithClient } from "./sync_sources_by_account.js";
import { sync_sourceToolWithClient } from "./sync_source.js";
import { available_bank_typesToolWithClient } from "./available_bank_types.js";

// Exports using a default client
export const mcpLocalhostTools = {
  accounts: accountsToolWithClient(getMcpClient),
  budget_buckets: budget_bucketsToolWithClient(getMcpClient),
  budget_bucket: budget_bucketToolWithClient(getMcpClient),
  monthly_periods: monthly_periodsToolWithClient(getMcpClient),
  monthly_period: monthly_periodToolWithClient(getMcpClient),
  current_monthly_period: current_monthly_periodToolWithClient(getMcpClient),
  transactions_by_account: transactions_by_accountToolWithClient(getMcpClient),
  transactions: transactionsToolWithClient(getMcpClient),
  transaction: transactionToolWithClient(getMcpClient),
  sync_sources: sync_sourcesToolWithClient(getMcpClient),
  sync_sources_by_account: sync_sources_by_accountToolWithClient(getMcpClient),
  sync_source: sync_sourceToolWithClient(getMcpClient),
  available_bank_types: available_bank_typesToolWithClient(getMcpClient),
} as const;

export const mcpLocalhostToolsWithClient = (client: Promise<Client> | Client) =>
  ({
    accounts: accountsToolWithClient(() => client),
    budget_buckets: budget_bucketsToolWithClient(() => client),
    budget_bucket: budget_bucketToolWithClient(() => client),
    monthly_periods: monthly_periodsToolWithClient(() => client),
    monthly_period: monthly_periodToolWithClient(() => client),
    current_monthly_period: current_monthly_periodToolWithClient(() => client),
    transactions_by_account: transactions_by_accountToolWithClient(
      () => client,
    ),
    transactions: transactionsToolWithClient(() => client),
    transaction: transactionToolWithClient(() => client),
    sync_sources: sync_sourcesToolWithClient(() => client),
    sync_sources_by_account: sync_sources_by_accountToolWithClient(
      () => client,
    ),
    sync_source: sync_sourceToolWithClient(() => client),
    available_bank_types: available_bank_typesToolWithClient(() => client),
  }) as const;

// Individual tool exports
export const accountsTool = accountsToolWithClient(getMcpClient);
export const budget_bucketsTool = budget_bucketsToolWithClient(getMcpClient);
export const budget_bucketTool = budget_bucketToolWithClient(getMcpClient);
export const monthly_periodsTool = monthly_periodsToolWithClient(getMcpClient);
export const monthly_periodTool = monthly_periodToolWithClient(getMcpClient);
export const current_monthly_periodTool =
  current_monthly_periodToolWithClient(getMcpClient);
export const transactions_by_accountTool =
  transactions_by_accountToolWithClient(getMcpClient);
export const transactionsTool = transactionsToolWithClient(getMcpClient);
export const transactionTool = transactionToolWithClient(getMcpClient);
export const sync_sourcesTool = sync_sourcesToolWithClient(getMcpClient);
export const sync_sources_by_accountTool =
  sync_sources_by_accountToolWithClient(getMcpClient);
export const sync_sourceTool = sync_sourceToolWithClient(getMcpClient);
export const available_bank_typesTool =
  available_bank_typesToolWithClient(getMcpClient);
