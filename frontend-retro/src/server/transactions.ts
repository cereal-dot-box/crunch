import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { z } from 'zod'
import { zodValidator } from '@tanstack/zod-adapter'
import type { Transaction } from '../types'

interface TransactionListResponse {
  transactions: Transaction[]
  total: number
}

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

export const listTransactions = createServerFn({ method: 'GET' })
  .inputValidator(zodValidator(z.object({ limit: z.number().optional(), offset: z.number().optional() }).optional()))
  .handler(async ({ data }) => {
    const limit = data?.limit ?? 50
    const offset = data?.offset ?? 0
    const result = await graphqlRequest<{ transactions: TransactionListResponse }>(
      `
      query Transactions($limit: Int, $offset: Int) {
        transactions(limit: $limit, offset: $offset) {
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
      { limit, offset }
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
    const limit = data.limit ?? 50
    const offset = data.offset ?? 0
    const result = await graphqlRequest<{ transactions_by_account: TransactionListResponse }>(
      `
      query TransactionsByAccount($account_id: Int!, $limit: Int, $offset: Int) {
        transactions_by_account(account_id: $account_id, limit: $limit, offset: $offset) {
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
      { account_id: data.accountId, limit, offset }
    )
    return result.transactions_by_account
  })

export const getTransaction = createServerFn({ method: 'GET' })
  .inputValidator(zodValidator(z.object({ id: z.number() })))
  .handler(async ({ data }) => {
    const result = await graphqlRequest<{ transaction: Transaction | null }>(
      `
      query Transaction($id: Int!) {
        transaction(id: $id) {
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
          plaid_category
          created_at
          updated_at
        }
      }
    `,
      { id: data.id }
    )
    return result.transaction
  })
