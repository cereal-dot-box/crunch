import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { zodValidator } from '@tanstack/zod-adapter'
import type { Account, SyncSource, AvailableBankType } from '../types'
import { graphqlRequest, getUserIdFromSession } from './graphql'
import { getSplitwiseCredential } from './splitwise'

export const listAccounts = createServerFn({ method: 'GET' })
  .handler(async () => {
    const userId = await getUserIdFromSession()
    if (!userId) throw new Error('Not authenticated')

    // Fetch accounts and Splitwise credentials in parallel
    const [accountsData, splitwiseData] = await Promise.all([
      graphqlRequest<{ accounts: Account[] }>(`
        query Accounts($userId: ID!) {
          accounts(userId: $userId) {
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
      `, { userId }),
      getSplitwiseCredential()
    ])

    const accounts = accountsData.accounts

    // Add Splitwise as an account if connected
    if (splitwiseData.connected && splitwiseData.credential) {
      const splitwiseAccount: Account = {
        id: -splitwiseData.credential.id, // Negative ID to distinguish
        name: 'Splitwise',
        bank: 'splitwise',
        type: 'splitwise',
        mask: null,
        current_balance: 0,
        available_balance: null,
        iso_currency_code: 'USD',
        is_active: true,
        created_at: splitwiseData.credential.created_at,
        updated_at: splitwiseData.credential.updated_at
      }
      accounts.push(splitwiseAccount)
    }

    return { accounts }
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
    const userId = await getUserIdFromSession()
    if (!userId) throw new Error('Not authenticated')

    const response = await graphqlRequest<{ deactivate_account: boolean }>(
      `
      mutation DeactivateAccount($userId: ID!, $account_id: Int!) {
        deactivate_account(userId: $userId, account_id: $account_id)
      }
    `,
      { userId, account_id: data.id }
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
    const userId = await getUserIdFromSession()
    if (!userId) throw new Error('Not authenticated')

    const response = await graphqlRequest<{ add_account: Account }>(
      `
      mutation AddAccount($userId: ID!, $input: AddAccountInput!) {
        add_account(userId: $userId, input: $input) {
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
      { userId, input }
    )
    return { account: response.add_account }
  })

export const getProviders = createServerFn({ method: 'GET' })
  .inputValidator(zodValidator(z.object({ accountId: z.number() })))
  .handler(async ({ data }) => {
    const userId = await getUserIdFromSession()
    if (!userId) throw new Error('Not authenticated')

    const response = await graphqlRequest<{ sync_sources_by_account: SyncSource[] }>(
      `
      query SyncSourcesByAccount($userId: ID!, $account_id: Int!) {
        sync_sources_by_account(userId: $userId, account_id: $account_id) {
          id
          account_id
          name
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
      { userId, account_id: data.accountId }
    )
    return { providers: response.sync_sources_by_account }
  })

export const getAvailableBankTypes = createServerFn({ method: 'GET' })
  .handler(async () => {
    // This is public data, no userId needed
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
    name: z.string(),
    email_address: z.string(),
    imap_host: z.string(),
    imap_port: z.number(),
    imap_password: z.string(),
    imap_folder: z.string().optional(),
  })))
  .handler(async ({ data: input }) => {
    const userId = await getUserIdFromSession()
    if (!userId) throw new Error('Not authenticated')

    const response = await graphqlRequest<{ add_sync_source: SyncSource }>(
      `
      mutation AddSyncSource($userId: ID!, $input: AddSyncSourceInput!) {
        add_sync_source(userId: $userId, input: $input) {
          id
          account_id
          name
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
      { userId, input }
    )
    return { provider: response.add_sync_source }
  })

export const updateSyncSource = createServerFn({ method: 'POST' })
  .inputValidator(zodValidator(z.object({
    id: z.number(),
    input: z.object({
      name: z.string().optional(),
      email_address: z.string().optional(),
      imap_host: z.string().optional(),
      imap_port: z.number().optional(),
      imap_password: z.string().optional(),
      imap_folder: z.string().optional(),
    }),
  })))
  .handler(async ({ data }) => {
    const userId = await getUserIdFromSession()
    if (!userId) throw new Error('Not authenticated')

    const response = await graphqlRequest<{ update_sync_source: SyncSource }>(
      `
      mutation UpdateSyncSource($userId: ID!, $id: Int!, $input: UpdateSyncSourceInput!) {
        update_sync_source(userId: $userId, id: $id, input: $input) {
          id
          account_id
          name
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
      { userId, id: data.id, input: data.input }
    )
    return { provider: response.update_sync_source }
  })

export const deleteSyncSource = createServerFn({ method: 'POST' })
  .inputValidator(zodValidator(z.object({ id: z.number() })))
  .handler(async ({ data }) => {
    const userId = await getUserIdFromSession()
    if (!userId) throw new Error('Not authenticated')

    const response = await graphqlRequest<{ delete_sync_source: boolean }>(
      `
      mutation DeleteSyncSource($userId: ID!, $id: Int!) {
        delete_sync_source(userId: $userId, id: $id)
      }
    `,
      { userId, id: data.id }
    )
    return response.delete_sync_source
  })

export const testSyncSourceConnection = createServerFn({ method: 'POST' })
  .inputValidator(zodValidator(z.object({ id: z.number() })))
  .handler(async ({ data }) => {
    const userId = await getUserIdFromSession()
    if (!userId) throw new Error('Not authenticated')

    const response = await graphqlRequest<{
      test_sync_source_connection: { success: boolean; error_message: string | null }
    }>(
      `
      mutation TestSyncSourceConnection($userId: ID!, $id: Int!) {
        test_sync_source_connection(userId: $userId, id: $id) {
          success
          error_message
        }
      }
    `,
      { userId, id: data.id }
    )
    return response.test_sync_source_connection
  })

export const syncSyncSource = createServerFn({ method: 'POST' })
  .inputValidator(zodValidator(z.object({ id: z.number() })))
  .handler(async ({ data }) => {
    const userId = await getUserIdFromSession()
    if (!userId) throw new Error('Not authenticated')

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
      mutation SyncSyncSource($userId: ID!, $id: Int!) {
        sync_sync_source(userId: $userId, id: $id) {
          timestamp
          emails_fetched
          jobs_enqueued
          errors
          duration
        }
      }
    `,
      { userId, id: data.id }
    )
    return response.sync_sync_source
  })
