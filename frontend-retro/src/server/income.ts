import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { zodValidator } from '@tanstack/zod-adapter'
import { graphqlRequest, getUserIdFromSession } from './graphql'

export interface MonthlyPeriod {
  id: number
  user_id: number
  month: string
  projected_income: number
  actual_income: number
  status: string
  notes: string | null
  created_at: string
  updated_at: string
  is_open: boolean
  is_closed: boolean
}

export interface CreateMonthlyPeriodInput {
  month: string
  projected_income: number
  notes?: string
}

export interface UpdateMonthlyPeriodInput {
  projected_income?: number
  actual_income?: number
  status?: string
  notes?: string
}

export const listMonthlyPeriods = createServerFn({ method: 'GET' })
  .handler(async () => {
    const userId = await getUserIdFromSession()
    if (!userId) throw new Error('Not authenticated')

    const data = await graphqlRequest<{ monthly_periods: MonthlyPeriod[] }>(`
      query GetMonthlyPeriods($userId: ID!) {
        monthly_periods(userId: $userId) {
          id
          user_id
          month
          projected_income
          actual_income
          status
          notes
          created_at
          updated_at
          is_open
          is_closed
        }
      }
    `, { userId })
    return data.monthly_periods
  })

export const getCurrentPeriod = createServerFn({ method: 'GET' })
  .handler(async () => {
    const userId = await getUserIdFromSession()
    if (!userId) throw new Error('Not authenticated')

    const data = await graphqlRequest<{ current_monthly_period: MonthlyPeriod | null }>(`
      query GetCurrentMonthlyPeriod($userId: ID!) {
        current_monthly_period(userId: $userId) {
          id
          user_id
          month
          projected_income
          actual_income
          status
          notes
          created_at
          updated_at
          is_open
        }
      }
    `, { userId })
    return data.current_monthly_period
  })

export const getMonthlyPeriod = createServerFn({ method: 'GET' })
  .inputValidator(zodValidator(z.object({ month: z.string() })))
  .handler(async ({ data }) => {
    const userId = await getUserIdFromSession()
    if (!userId) throw new Error('Not authenticated')

    const result = await graphqlRequest<{ monthly_period: MonthlyPeriod }>(
      `
      query GetMonthlyPeriod($userId: ID!, $month: String!) {
        monthly_period(userId: $userId, month: $month) {
          id
          user_id
          month
          projected_income
          actual_income
          status
          notes
          created_at
          updated_at
          is_open
          is_closed
        }
      }
    `,
      { userId, month: data.month }
    )
    return result.monthly_period
  })

export const createMonthlyPeriod = createServerFn({ method: 'POST' })
  .inputValidator(zodValidator(z.object({
    month: z.string(),
    projected_income: z.number(),
    notes: z.string().optional(),
  })))
  .handler(async ({ data: input }) => {
    const userId = await getUserIdFromSession()
    if (!userId) throw new Error('Not authenticated')

    const result = await graphqlRequest<{ create_monthly_period: MonthlyPeriod }>(
      `
      mutation CreateMonthlyPeriod($userId: ID!, $input: CreateMonthlyPeriodInput!) {
        create_monthly_period(userId: $userId, input: $input) {
          id
          user_id
          month
          projected_income
          actual_income
          status
          notes
          created_at
          updated_at
          is_open
        }
      }
    `,
      { userId, input }
    )
    return result.create_monthly_period
  })

export const updateMonthlyPeriod = createServerFn({ method: 'POST' })
  .inputValidator(zodValidator(z.object({
    id: z.number(),
    input: z.object({
      projected_income: z.number().optional(),
      actual_income: z.number().optional(),
      status: z.string().optional(),
      notes: z.string().optional(),
    }),
  })))
  .handler(async ({ data }) => {
    const userId = await getUserIdFromSession()
    if (!userId) throw new Error('Not authenticated')

    const result = await graphqlRequest<{ update_monthly_period: MonthlyPeriod }>(
      `
      mutation UpdateMonthlyPeriod($userId: ID!, $id: Int!, $input: UpdateMonthlyPeriodInput!) {
        update_monthly_period(userId: $userId, id: $id, input: $input) {
          id
          user_id
          month
          projected_income
          actual_income
          status
          notes
          created_at
          updated_at
          is_open
          is_closed
        }
      }
    `,
      { userId, id: data.id, input: data.input }
    )
    return result.update_monthly_period
  })

export const closeMonthlyPeriod = createServerFn({ method: 'POST' })
  .inputValidator(zodValidator(z.object({ id: z.number() })))
  .handler(async ({ data }) => {
    const userId = await getUserIdFromSession()
    if (!userId) throw new Error('Not authenticated')

    const result = await graphqlRequest<{ close_monthly_period: MonthlyPeriod }>(
      `
      mutation CloseMonthlyPeriod($userId: ID!, $id: Int!) {
        close_monthly_period(userId: $userId, id: $id) {
          id
          user_id
          month
          projected_income
          actual_income
          status
          notes
          created_at
          updated_at
          is_open
          is_closed
        }
      }
    `,
      { userId, id: data.id }
    )
    return result.close_monthly_period
  })

export const deleteMonthlyPeriod = createServerFn({ method: 'POST' })
  .inputValidator(zodValidator(z.object({ id: z.number() })))
  .handler(async ({ data }) => {
    const userId = await getUserIdFromSession()
    if (!userId) throw new Error('Not authenticated')

    const result = await graphqlRequest<{ delete_monthly_period: boolean }>(
      `
      mutation DeleteMonthlyPeriod($userId: ID!, $id: Int!) {
        delete_monthly_period(userId: $userId, id: $id)
      }
    `,
      { userId, id: data.id }
    )
    return result.delete_monthly_period
  })
