import type { ColumnType } from 'kysely';

export interface AccountRow {
  id: number;
  user_id: number;
  name: string;
  bank: string | null;
  type: string | null;
  mask: string | null;
  iso_currency_code: string;
  is_active: number | boolean;
  created_at: string;
  updated_at: string | null;
}

export interface CreateAccountParams {
  userId: number;
  name: string;
  bank: string | null;
  type: string | null;
  mask: string | null;
  isoCurrencyCode: string;
}

export interface UpdateAccountParams {
  name?: string;
  bank?: string | null;
  type?: string | null;
  mask?: string | null;
  iso_currency_code?: string;
}
