import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { z } from 'zod'
import { zodValidator } from '@tanstack/zod-adapter'
import type { Account, SyncSource, AvailableBankType } from '../types'

const API_URL = import.meta.env.VITE_API_URL ?? ''

interface GraphQLResponse<T> {
  data?: T
  errors?: Array<{ message: string }>
}

async function graphqlRequest<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const request = getRequest()
  const cookieHeader = request?.headers.get('cookie') || ''

  const response = await fetch(`${API_URL}/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookieHeader,
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const result: GraphQLResponse<T> = await response.json()

  if (result.errors) {
    throw new Error(result.errors[0]?.message || 'GraphQL error')
  }

  if (!result.data) {
    throw new Error('No data returned from GraphQL')
  }

  return result.data
}

export const listAccounts = createServerFn({ method: 'GET' })
  .handler(async () => {
    const data = await graphqlRequest<{ accounts: Account[] }>(`
      query Accounts {
        accounts {
          id
          name
          bank
          type
          mask
          current_balance
          available_balance
          iso_currency_code
          is_active
          created_at
          updated_at
        }
      }
    `)
    return { accounts: data.accounts }
  })

export const getAccount = createServerFn({ method: 'GET' })
  .inputValidator(zodValidator(z.object({ id: z.number() })))
  .handler(async ({ data }) => {
    const result = await listAccounts()
    const account = result.accounts.find((a) => a.id === data.id)
    if (!account) {
      throw new Error('Account not found')
    }
    return { account }
  })

export const deactivateAccount = createServerFn({ method: 'POST' })
  .inputValidator(zodValidator(z.object({ id: z.number() })))
  .handler(async ({ data }) => {
    const response = await graphqlRequest<{ deactivate_account: boolean }>(
      `
      mutation DeactivateAccount($account_id: Int!) {
        deactivate_account(account_id: $account_id)
      }
    `,
      { account_id: data.id }
    )
    return response.deactivate_account
  })

export const addAccount = createServerFn({ method: 'POST' })
  .inputValidator(zodValidator(z.object({
    name: z.string(),
    bank: z.string(),
    type: z.string(),
    mask: z.string(),
    iso_currency_code: z.string(),
  })))
  .handler(async ({ data: input }) => {
    const response = await graphqlRequest<{ add_account: Account }>(
      `
      mutation AddAccount($input: AddAccountInput!) {
        add_account(input: $input) {
          id
          name
          bank
          type
          mask
          current_balance
          available_balance
          iso_currency_code
          is_active
          created_at
          updated_at
        }
      }
    `,
      { input }
    )
    return { account: response.add_account }
  })

export const getProviders = createServerFn({ method: 'GET' })
  .inputValidator(zodValidator(z.object({ accountId: z.number() })))
  .handler(async ({ data }) => {
    const response = await graphqlRequest<{ sync_sources_by_account: SyncSource[] }>(
      `
      query SyncSourcesByAccount($account_id: Int!) {
        sync_sources_by_account(account_id: $account_id) {
          id
          account_id
          name
          type
          email_address
          imap_host
          imap_port
          imap_folder
          status
          last_synced_at
          last_processed_uid
          is_active
          created_at
          balance_count
          transaction_count
        }
      }
    `,
      { account_id: data.accountId }
    )
    return { providers: response.sync_sources_by_account }
  })

export const getAvailableBankTypes = createServerFn({ method: 'GET' })
  .handler(async () => {
    const response = await graphqlRequest<{ available_bank_types: AvailableBankType[] }>(`
      query AvailableBankTypes {
        available_bank_types {
          bank
          types
        }
      }
    `)
    return response.available_bank_types
  })

export const addSyncSource = createServerFn({ method: 'POST' })
  .inputValidator(zodValidator(z.object({
    account_id: z.number(),
    type: z.string(),
    name: z.string(),
    email_address: z.string(),
    imap_host: z.string(),
    imap_port: z.number(),
    imap_password: z.string(),
    imap_folder: z.string().optional(),
  })))
  .handler(async ({ data: input }) => {
    const response = await graphqlRequest<{ add_sync_source: SyncSource }>(
      `
      mutation AddSyncSource($input: AddSyncSourceInput!) {
        add_sync_source(input: $input) {
          id
          account_id
          name
          type
          email_address
          imap_host
          imap_port
          imap_folder
          status
          last_synced_at
          last_processed_uid
          is_active
          created_at
          balance_count
          transaction_count
        }
      }
    `,
      { input }
    )
    return { provider: response.add_sync_source }
  })

export const updateSyncSource = createServerFn({ method: 'POST' })
  .inputValidator(zodValidator(z.object({
    id: z.number(),
    input: z.object({
      name: z.string().optional(),
      type: z.string().optional(),
      email_address: z.string().optional(),
      imap_host: z.string().optional(),
      imap_port: z.number().optional(),
      imap_password: z.string().optional(),
      imap_folder: z.string().optional(),
    }),
  })))
  .handler(async ({ data }) => {
    const response = await graphqlRequest<{ update_sync_source: SyncSource }>(
      `
      mutation UpdateSyncSource($id: Int!, $input: UpdateSyncSourceInput!) {
        update_sync_source(id: $id, input: $input) {
          id
          account_id
          name
          type
          email_address
          imap_host
          imap_port
          imap_folder
          status
          last_synced_at
          last_processed_uid
          is_active
          created_at
          balance_count
          transaction_count
        }
      }
    `,
      { id: data.id, input: data.input }
    )
    return { provider: response.update_sync_source }
  })

export const deleteSyncSource = createServerFn({ method: 'POST' })
  .inputValidator(zodValidator(z.object({ id: z.number() })))
  .handler(async ({ data }) => {
    const response = await graphqlRequest<{ delete_sync_source: boolean }>(
      `
      mutation DeleteSyncSource($id: Int!) {
        delete_sync_source(id: $id)
      }
    `,
      { id: data.id }
    )
    return response.delete_sync_source
  })

export const testSyncSourceConnection = createServerFn({ method: 'POST' })
  .inputValidator(zodValidator(z.object({ id: z.number() })))
  .handler(async ({ data }) => {
    const response = await graphqlRequest<{
      test_sync_source_connection: { success: boolean; error_message: string | null }
    }>(
      `
      mutation TestSyncSourceConnection($id: Int!) {
        test_sync_source_connection(id: $id) {
          success
          error_message
        }
      }
    `,
      { id: data.id }
    )
    return response.test_sync_source_connection
  })

export const syncSyncSource = createServerFn({ method: 'POST' })
  .inputValidator(zodValidator(z.object({ id: z.number() })))
  .handler(async ({ data }) => {
    const response = await graphqlRequest<{
      sync_sync_source: {
        timestamp: string
        emails_fetched: number
        jobs_enqueued: number
        errors: number
        duration: number
      }
    }>(
      `
      mutation SyncSyncSource($id: Int!) {
        sync_sync_source(id: $id) {
          timestamp
          emails_fetched
          jobs_enqueued
          errors
          duration
        }
      }
    `,
      { id: data.id }
    )
    return response.sync_sync_source
  })
