import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { zodValidator } from '@tanstack/zod-adapter'
import { graphqlRequest, getUserIdFromSession } from './graphql'

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

export const listBudgets = createServerFn({ method: 'GET' })
  .handler(async () => {
    const userId = await getUserIdFromSession()
    if (!userId) throw new Error('Not authenticated')

    const data = await graphqlRequest<{ budget_buckets: BudgetBucket[] }>(`
      query GetBudgetBuckets($userId: ID!) {
        budget_buckets(userId: $userId) {
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
    `, { userId })
    return data.budget_buckets
  })

export const getBudget = createServerFn({ method: 'GET' })
  .inputValidator(zodValidator(z.object({ bucketId: z.string() })))
  .handler(async ({ data }) => {
    const userId = await getUserIdFromSession()
    if (!userId) throw new Error('Not authenticated')

    const result = await graphqlRequest<{ budget_bucket: BudgetBucket }>(
      `
      query GetBudgetBucket($userId: ID!, $bucketId: String!) {
        budget_bucket(userId: $userId, bucket_id: $bucketId) {
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
      { userId, bucketId: data.bucketId }
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
    const userId = await getUserIdFromSession()
    if (!userId) throw new Error('Not authenticated')

    const result = await graphqlRequest<{ update_budget_bucket: BudgetBucket }>(
      `
      mutation UpdateBudgetBucket($userId: ID!, $bucketId: String!, $input: UpdateBudgetBucketInput!) {
        update_budget_bucket(userId: $userId, bucket_id: $bucketId, input: $input) {
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
      { userId, bucketId: data.bucketId, input: data.input }
    )
    return result.update_budget_bucket
  })
