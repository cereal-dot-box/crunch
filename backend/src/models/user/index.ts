import * as repo from './repository';
import type { UserRow, CreateUserParams } from './types';

export class User {
  constructor(private data: UserRow) {}

  get id() { return this.data.id; }
  get email() { return this.data.email; }
  get passwordHash() { return this.data.password_hash; }
  get createdAt() { return this.data.created_at; }

  toJSON(): UserRow {
    return { ...this.data };
  }
}

// Static factory methods
User.getById = async (id: number): Promise<User | null> => {
  const row = await repo.getUserById(id);
  return row ? new User(row) : null;
};

User.getByEmail = async (email: string): Promise<User | null> => {
  const row = await repo.getUserByEmail(email);
  return row ? new User(row) : null;
};

User.emailExists = async (email: string): Promise<boolean> => {
  return await repo.emailExists(email);
};

User.create = async (params: CreateUserParams): Promise<UserRow> => {
  return await repo.createUser(params);
};

export type { UserRow, CreateUserParams };
