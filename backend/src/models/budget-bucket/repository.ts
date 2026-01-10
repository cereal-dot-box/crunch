import { db } from '../../lib/database';
import type { BudgetBucketRow, CreateBudgetBucketParams, UpdateBudgetBucketParams } from './types';

export async function getBudgetBucketsByUserId(userId: number): Promise<BudgetBucketRow[]> {
  return await db
    .selectFrom('BudgetBucket')
    .selectAll()
    .where('user_id', '=', userId)
    .where('is_active', '=', 1)
    .orderBy('bucket_id', 'asc')
    .execute();
}

export async function getBudgetBucket(
  userId: number,
  bucketId: string
): Promise<BudgetBucketRow | undefined> {
  return await db
    .selectFrom('BudgetBucket')
    .selectAll()
    .where('user_id', '=', userId)
    .where('bucket_id', '=', bucketId)
    .where('is_active', '=', 1)
    .executeTakeFirst();
}

export async function createBudgetBucket(
  params: CreateBudgetBucketParams
): Promise<BudgetBucketRow> {
  return await db
    .insertInto('BudgetBucket')
    .values({
      user_id: params.userId,
      bucket_id: params.bucketId,
      name: params.name,
      monthly_limit: params.monthlyLimit,
      color: params.color,
      is_active: 1,
    })
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function updateBudgetBucket(
  userId: number,
  bucketId: string,
  params: UpdateBudgetBucketParams
): Promise<BudgetBucketRow | undefined> {
  return await db
    .updateTable('BudgetBucket')
    .set({
      ...params,
      updated_at: new Date().toISOString(),
    })
    .where('user_id', '=', userId)
    .where('bucket_id', '=', bucketId)
    .returningAll()
    .executeTakeFirst();
}

export async function initializeDefaultBuckets(userId: number): Promise<BudgetBucketRow[]> {
  const { DEFAULT_BUDGETS } = await import('../../config/budgets');

  const buckets = DEFAULT_BUDGETS.map((bucket) => ({
    user_id: userId,
    bucket_id: bucket.id,
    name: bucket.name,
    monthly_limit: bucket.monthlyLimit,
    color: bucket.color,
    is_active: 1,
  }));

  return await db.insertInto('BudgetBucket').values(buckets).returningAll().execute();
}
