import * as repo from './repository';
import type { BudgetBucketRow, CreateBudgetBucketParams, UpdateBudgetBucketParams } from './types';

export class BudgetBucket {
  static getByUserId: (userId: number) => Promise<BudgetBucket[]>;
  static get: (userId: number, bucketId: string) => Promise<BudgetBucket | null>;
  static create: (params: CreateBudgetBucketParams) => Promise<BudgetBucketRow>;
  static update: (userId: number, bucketId: string, params: UpdateBudgetBucketParams) => Promise<BudgetBucket | null>;
  static initializeDefaults: (userId: number) => Promise<BudgetBucket[]>;
  constructor(private data: BudgetBucketRow) {}

  get id() { return this.data.id; }
  get userId() { return this.data.user_id; }
  get bucketId() { return this.data.bucket_id; }
  get name() { return this.data.name; }
  get monthlyLimit() { return this.data.monthly_limit; }
  get color() { return this.data.color; }
  get isActive() { return this.data.is_active === 1; }
  get createdAt() { return this.data.created_at; }
  get updatedAt() { return this.data.updated_at; }

  toJSON(): BudgetBucketRow {
    return { ...this.data };
  }
}

// Static factory methods
BudgetBucket.getByUserId = async (userId: number): Promise<BudgetBucket[]> => {
  const rows = await repo.getBudgetBucketsByUserId(userId);
  return rows.map(row => new BudgetBucket(row));
};

BudgetBucket.get = async (userId: number, bucketId: string): Promise<BudgetBucket | null> => {
  const row = await repo.getBudgetBucket(userId, bucketId);
  return row ? new BudgetBucket(row) : null;
};

BudgetBucket.create = async (params: CreateBudgetBucketParams): Promise<BudgetBucketRow> => {
  return await repo.createBudgetBucket(params);
};

BudgetBucket.update = async (
  userId: number,
  bucketId: string,
  params: UpdateBudgetBucketParams
): Promise<BudgetBucket | null> => {
  const row = await repo.updateBudgetBucket(userId, bucketId, params);
  return row ? new BudgetBucket(row) : null;
};

BudgetBucket.initializeDefaults = async (userId: number): Promise<BudgetBucket[]> => {
  const rows = await repo.initializeDefaultBuckets(userId);
  return rows.map(row => new BudgetBucket(row));
};

export type { BudgetBucketRow, CreateBudgetBucketParams, UpdateBudgetBucketParams };
