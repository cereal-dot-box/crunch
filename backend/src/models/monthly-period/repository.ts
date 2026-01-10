import { db } from '../../lib/database';
import type { MonthlyPeriodRow, CreateMonthlyPeriodParams, UpdateMonthlyPeriodParams } from './types';

export async function getMonthlyPeriodsByUserId(userId: number): Promise<MonthlyPeriodRow[]> {
  return await db
    .selectFrom('MonthlyPeriod')
    .selectAll()
    .where('user_id', '=', userId)
    .orderBy('month', 'desc')
    .execute();
}

export async function getMonthlyPeriod(
  userId: number,
  month: string
): Promise<MonthlyPeriodRow | undefined> {
  return await db
    .selectFrom('MonthlyPeriod')
    .selectAll()
    .where('user_id', '=', userId)
    .where('month', '=', month)
    .executeTakeFirst();
}

export async function getMonthlyPeriodById(
  id: number,
  userId: number
): Promise<MonthlyPeriodRow | undefined> {
  return await db
    .selectFrom('MonthlyPeriod')
    .selectAll()
    .where('id', '=', id)
    .where('user_id', '=', userId)
    .executeTakeFirst();
}

export async function createMonthlyPeriod(
  params: CreateMonthlyPeriodParams
): Promise<MonthlyPeriodRow> {
  const now = new Date().toISOString();

  return await db
    .insertInto('MonthlyPeriod')
    .values({
      user_id: params.userId,
      month: params.month,
      projected_income: params.projectedIncome,
      actual_income: 0,
      notes: params.notes ?? null,
      status: 'open',
      created_at: now,
      updated_at: now,
    })
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function updateMonthlyPeriod(
  id: number,
  userId: number,
  params: UpdateMonthlyPeriodParams
): Promise<MonthlyPeriodRow | undefined> {
  const updateValues: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (params.projectedIncome !== undefined) {
    updateValues.projected_income = params.projectedIncome;
  }
  if (params.actualIncome !== undefined) {
    updateValues.actual_income = params.actualIncome;
  }
  if (params.status !== undefined) {
    updateValues.status = params.status;
  }
  if (params.notes !== undefined) {
    updateValues.notes = params.notes;
  }

  return await db
    .updateTable('MonthlyPeriod')
    .set(updateValues)
    .where('id', '=', id)
    .where('user_id', '=', userId)
    .returningAll()
    .executeTakeFirst();
}

export async function closeMonthlyPeriod(
  id: number,
  userId: number
): Promise<MonthlyPeriodRow | undefined> {
  return await db
    .updateTable('MonthlyPeriod')
    .set({
      status: 'closed',
      updated_at: new Date().toISOString(),
    })
    .where('id', '=', id)
    .where('user_id', '=', userId)
    .returningAll()
    .executeTakeFirst();
}

export async function deleteMonthlyPeriod(
  id: number,
  userId: number
): Promise<void> {
  await db
    .deleteFrom('MonthlyPeriod')
    .where('id', '=', id)
    .where('user_id', '=', userId)
    .execute();
}

export async function getOpenMonthlyPeriod(userId: number): Promise<MonthlyPeriodRow | undefined> {
  return await db
    .selectFrom('MonthlyPeriod')
    .selectAll()
    .where('user_id', '=', userId)
    .where('status', '=', 'open')
    .orderBy('month', 'desc')
    .executeTakeFirst();
}
