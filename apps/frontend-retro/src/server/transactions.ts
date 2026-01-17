import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { zodValidator } from '@tanstack/zod-adapter'
import type { Transaction } from '../types'
import { graphqlRequest, getUserIdFromSession } from './graphql'

interface TransactionListResponse {
  transactions: Transaction[]
  total: number
}

export const listTransactions = createServerFn({ method: 'GET' })
  .inputValidator(zodValidator(z.object({ limit: z.number().optional(), offset: z.number().optional() }).optional()))
  .handler(async ({ data }) => {
    const userId = await getUserIdFromSession()
    if (!userId) throw new Error('Not authenticated')

    const limit = data?.limit ?? 50
    const offset = data?.offset ?? 0
    const result = await graphqlRequest<{ transactions: TransactionListResponse }>(
      `
      query Transactions($userId: ID!, $limit: Int, $offset: Int) {
        transactions(userId: $userId, limit: $limit, offset: $offset) {
          transactions {
            id
            transaction_id
            account_id
            amount
            iso_currency_code
            date
            authorized_date
            name
            merchant_name
            pending
            payment_channel
            created_at
          }
          total
        }
      }
    `,
      { userId, limit, offset }
    )
    return result.transactions
  })

export const listTransactionsByAccount = createServerFn({ method: 'GET' })
  .inputValidator(zodValidator(z.object({
    accountId: z.number(),
    limit: z.number().optional(),
    offset: z.number().optional(),
  })))
  .handler(async ({ data }) => {
    const userId = await getUserIdFromSession()
    if (!userId) throw new Error('Not authenticated')

    const limit = data.limit ?? 50
    const offset = data.offset ?? 0
    const result = await graphqlRequest<{ transactions_by_account: TransactionListResponse }>(
      `
      query TransactionsByAccount($userId: ID!, $account_id: Int!, $limit: Int, $offset: Int) {
        transactions_by_account(userId: $userId, account_id: $account_id, limit: $limit, offset: $offset) {
          transactions {
            id
            transaction_id
            account_id
            amount
            iso_currency_code
            date
            authorized_date
            name
            merchant_name
            pending
            payment_channel
            created_at
          }
          total
        }
      }
    `,
      { userId, account_id: data.accountId, limit, offset }
    )
    return result.transactions_by_account
  })

export const getTransaction = createServerFn({ method: 'GET' })
  .inputValidator(zodValidator(z.object({ id: z.number() })))
  .handler(async ({ data }) => {
    const userId = await getUserIdFromSession()
    if (!userId) throw new Error('Not authenticated')

    const result = await graphqlRequest<{ transaction: Transaction | null }>(
      `
      query Transaction($userId: ID!, $id: Int!) {
        transaction(userId: $userId, id: $id) {
          id
          transaction_id
          account_id
          amount
          iso_currency_code
          date
          authorized_date
          name
          merchant_name
          pending
          payment_channel
          created_at
          updated_at
        }
      }
    `,
      { userId, id: data.id }
    )
    return result.transaction
  })
