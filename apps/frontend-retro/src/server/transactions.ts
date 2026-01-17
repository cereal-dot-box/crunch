import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { zodValidator } from '@tanstack/zod-adapter'
import type { Transaction } from '../types'
import { graphqlRequest, getUserIdFromSession } from './graphql'
import {
  TransactionsDocument,
  TransactionsByAccountDocument,
  TransactionDocument,
} from '../graphql/graphql'

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
      TransactionsDocument,
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
      TransactionsByAccountDocument,
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
      TransactionDocument,
      { userId, id: data.id }
    )
    return result.transaction
  })
