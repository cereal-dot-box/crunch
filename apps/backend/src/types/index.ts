export interface User {
  id: number;
  password_hash: string;
  created_at: string;
}

export interface Session {
  id: string;
  user_id: number;
  created_at: string;
  expires_at: string;
  last_activity_at: string;
}

export interface Account {
  id: number;
  user_id: number;
  name: string;
  bank: string | null;
  type: string | null;
  mask: string | null;
  current_balance: number | null;
  available_balance: number | null;
  iso_currency_code: string;
  is_active: number;
  created_at: string;
  updated_at: string;
}

// Augment Fastify session interface for type safety
declare module 'fastify' {
  interface Session {
    userId?: number;
  }
}
