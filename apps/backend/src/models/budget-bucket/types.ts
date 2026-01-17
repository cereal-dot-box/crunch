export interface BudgetBucketRow {
  id: number;
  user_id: number;
  bucket_id: string;
  name: string;
  monthly_limit: number;
  color: string;
  is_active: number | boolean;
  created_at: string;
  updated_at: string | null;
}

export interface CreateBudgetBucketParams {
  userId: number;
  bucketId: string;
  name: string;
  monthlyLimit: number;
  color: string;
}

export interface UpdateBudgetBucketParams {
  name?: string;
  monthly_limit?: number;
  color?: string;
}
