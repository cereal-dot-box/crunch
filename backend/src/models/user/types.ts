export interface UserRow {
  id: number;
  email: string;
  password_hash: string;
  created_at: string;
}

export interface CreateUserParams {
  email: string;
  passwordHash: string;
}
