export interface MonthlyPeriodRow {
  id: number;
  user_id: string;
  month: string;
  projected_income: number; // What you expected
  actual_income: number; // What actually happened
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  is_open?: boolean;
  is_closed?: boolean;
}

export interface CreateMonthlyPeriodParams {
  userId: string;
  month: string;
  projectedIncome: number;
  notes?: string | null;
}

export interface UpdateMonthlyPeriodParams {
  projectedIncome?: number;
  actualIncome?: number;
  status?: string;
  notes?: string | null;
}
