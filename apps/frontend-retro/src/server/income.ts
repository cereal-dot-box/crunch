import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { zodValidator } from '@tanstack/zod-adapter'
import { graphqlRequest, getUserIdFromSession } from './graphql'
import {
  GetMonthlyPeriodsDocument,
  GetCurrentMonthlyPeriodDocument,
  GetMonthlyPeriodDocument,
  CreateMonthlyPeriodDocument,
  UpdateMonthlyPeriodDocument,
  CloseMonthlyPeriodDocument,
  DeleteMonthlyPeriodDocument,
} from '../graphql/graphql'

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

    const data = await graphqlRequest<{ monthly_periods: MonthlyPeriod[] }>(
      GetMonthlyPeriodsDocument,
      { userId }
    )
    return data.monthly_periods
  })

export const getCurrentPeriod = createServerFn({ method: 'GET' })
  .handler(async () => {
    const userId = await getUserIdFromSession()
    if (!userId) throw new Error('Not authenticated')

    const data = await graphqlRequest<{ current_monthly_period: MonthlyPeriod | null }>(
      GetCurrentMonthlyPeriodDocument,
      { userId }
    )
    return data.current_monthly_period
  })

export const getMonthlyPeriod = createServerFn({ method: 'GET' })
  .inputValidator(zodValidator(z.object({ month: z.string() })))
  .handler(async ({ data }) => {
    const userId = await getUserIdFromSession()
    if (!userId) throw new Error('Not authenticated')

    const result = await graphqlRequest<{ monthly_period: MonthlyPeriod }>(
      GetMonthlyPeriodDocument,
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
      CreateMonthlyPeriodDocument,
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
      UpdateMonthlyPeriodDocument,
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
      CloseMonthlyPeriodDocument,
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
      DeleteMonthlyPeriodDocument,
      { userId, id: data.id }
    )
    return result.delete_monthly_period
  })
