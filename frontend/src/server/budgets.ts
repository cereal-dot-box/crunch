import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { z } from 'zod'
import { zodValidator } from '@tanstack/zod-adapter'

export interface BudgetBucket {
  id: number
  bucket_id: string
  name: string
  monthly_limit: number
  color: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface UpdateBudgetBucketInput {
  name?: string
  monthly_limit?: number
  color?: string
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

export const listBudgets = createServerFn({ method: 'GET' })
  .handler(async () => {
    const data = await graphqlRequest<{ budget_buckets: BudgetBucket[] }>(`
      query GetBudgetBuckets {
        budget_buckets {
          id
          bucket_id
          name
          monthly_limit
          color
          is_active
          created_at
          updated_at
        }
      }
    `)
    return data.budget_buckets
  })

export const getBudget = createServerFn({ method: 'GET' })
  .inputValidator(zodValidator(z.object({ bucketId: z.string() })))
  .handler(async ({ data }) => {
    const result = await graphqlRequest<{ budget_bucket: BudgetBucket }>(
      `
      query GetBudgetBucket($bucketId: String!) {
        budget_bucket(bucket_id: $bucketId) {
          id
          bucket_id
          name
          monthly_limit
          color
          is_active
          created_at
          updated_at
        }
      }
    `,
      { bucketId: data.bucketId }
    )
    return result.budget_bucket
  })

export const updateBudget = createServerFn({ method: 'POST' })
  .inputValidator(zodValidator(z.object({
    bucketId: z.string(),
    input: z.object({
      name: z.string().optional(),
      monthly_limit: z.number().optional(),
      color: z.string().optional(),
    }),
  })))
  .handler(async ({ data }) => {
    const result = await graphqlRequest<{ update_budget_bucket: BudgetBucket }>(
      `
      mutation UpdateBudgetBucket($bucketId: String!, $input: UpdateBudgetBucketInput!) {
        update_budget_bucket(bucket_id: $bucketId, input: $input) {
          id
          bucket_id
          name
          monthly_limit
          color
          is_active
          created_at
          updated_at
        }
      }
    `,
      { bucketId: data.bucketId, input: data.input }
    )
    return result.update_budget_bucket
  })
