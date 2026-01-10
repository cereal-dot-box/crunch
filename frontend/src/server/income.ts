import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { z } from 'zod'
import { zodValidator } from '@tanstack/zod-adapter'

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

export const listMonthlyPeriods = createServerFn({ method: 'GET' })
  .handler(async () => {
    const data = await graphqlRequest<{ monthly_periods: MonthlyPeriod[] }>(`
      query GetMonthlyPeriods {
        monthly_periods {
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
    `)
    return data.monthly_periods
  })

export const getCurrentPeriod = createServerFn({ method: 'GET' })
  .handler(async () => {
    const data = await graphqlRequest<{ current_monthly_period: MonthlyPeriod | null }>(`
      query GetCurrentMonthlyPeriod {
        current_monthly_period {
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
    `)
    return data.current_monthly_period
  })

export const getMonthlyPeriod = createServerFn({ method: 'GET' })
  .inputValidator(zodValidator(z.object({ month: z.string() })))
  .handler(async ({ data }) => {
    const result = await graphqlRequest<{ monthly_period: MonthlyPeriod }>(
      `
      query GetMonthlyPeriod($month: String!) {
        monthly_period(month: $month) {
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
      { month: data.month }
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
    const result = await graphqlRequest<{ create_monthly_period: MonthlyPeriod }>(
      `
      mutation CreateMonthlyPeriod($input: CreateMonthlyPeriodInput!) {
        create_monthly_period(input: $input) {
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
      { input }
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
    const result = await graphqlRequest<{ update_monthly_period: MonthlyPeriod }>(
      `
      mutation UpdateMonthlyPeriod($id: Int!, $input: UpdateMonthlyPeriodInput!) {
        update_monthly_period(id: $id, input: $input) {
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
      { id: data.id, input: data.input }
    )
    return result.update_monthly_period
  })

export const closeMonthlyPeriod = createServerFn({ method: 'POST' })
  .inputValidator(zodValidator(z.object({ id: z.number() })))
  .handler(async ({ data }) => {
    const result = await graphqlRequest<{ close_monthly_period: MonthlyPeriod }>(
      `
      mutation CloseMonthlyPeriod($id: Int!) {
        close_monthly_period(id: $id) {
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
      { id: data.id }
    )
    return result.close_monthly_period
  })

export const deleteMonthlyPeriod = createServerFn({ method: 'POST' })
  .inputValidator(zodValidator(z.object({ id: z.number() })))
  .handler(async ({ data }) => {
    const result = await graphqlRequest<{ delete_monthly_period: boolean }>(
      `
      mutation DeleteMonthlyPeriod($id: Int!) {
        delete_monthly_period(id: $id)
      }
    `,
      { id: data.id }
    )
    return result.delete_monthly_period
  })
