import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { zodValidator } from '@tanstack/zod-adapter'
import type { Account, SyncSource, AvailableBankType } from '../types'
import { graphqlRequest, getUserIdFromSession } from './graphql'
import { getSplitwiseCredential } from './splitwise'
import {
  AccountsDocument,
  DeactivateAccountDocument,
  AddAccountDocument,
  SyncSourcesByAccountDocument,
  AvailableBankTypesDocument,
  AddSyncSourceDocument,
  UpdateSyncSourceDocument,
  DeleteSyncSourceDocument,
  TestSyncSourceConnectionDocument,
  SyncSyncSourceDocument,
} from '../graphql/graphql'

export const listAccounts = createServerFn({ method: 'GET' })
  .handler(async () => {
    const userId = await getUserIdFromSession()
    if (!userId) throw new Error('Not authenticated')

    // Fetch accounts and Splitwise credentials in parallel
    const [accountsData, splitwiseData] = await Promise.all([
      graphqlRequest<{ accounts: Account[] }>(AccountsDocument, { userId }),
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
      DeactivateAccountDocument,
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
      AddAccountDocument,
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
      SyncSourcesByAccountDocument,
      { userId, account_id: data.accountId }
    )
    return { providers: response.sync_sources_by_account }
  })

export const getAvailableBankTypes = createServerFn({ method: 'GET' })
  .handler(async () => {
    // This is public data, no userId needed
    const response = await graphqlRequest<{ available_bank_types: AvailableBankType[] }>(
      AvailableBankTypesDocument,
      {}
    )
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
      AddSyncSourceDocument,
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
      UpdateSyncSourceDocument,
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
      DeleteSyncSourceDocument,
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
      TestSyncSourceConnectionDocument,
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
      SyncSyncSourceDocument,
      { userId, id: data.id }
    )
    return response.sync_sync_source
  })
