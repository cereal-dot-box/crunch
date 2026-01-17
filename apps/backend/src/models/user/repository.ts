import { db } from '../../lib/database';
import type { UserRow, CreateUserParams } from './types';

export async function createUser(params: CreateUserParams): Promise<UserRow> {
  const id = crypto.randomUUID();
  return await db
    .insertInto('User')
    .values({ id, email: params.email, password_hash: params.passwordHash })
    .returningAll()
    .executeTakeFirstOrThrow();
}

/**
 * Get or create a user by ID (for syncing with auth service)
 * Used when a userId from the auth service needs to exist in the backend
 */
export async function getOrCreateUserById(id: string, email: string): Promise<UserRow> {
  const existing = await getUserById(id);
  if (existing) {
    return existing;
  }

  return await db
    .insertInto('User')
    .values({ id, email, password_hash: '' })
    .returningAll()
    .executeTakeFirstOrThrow();
}

/**
 * Ensure a user exists in the backend (for auth service integration)
 * Creates a stub user if the userId doesn't exist
 * This allows the auth service (source of truth) to have users that
 * automatically sync to the backend's database for foreign key constraints.
 */
export async function ensureUserExists(id: string): Promise<UserRow> {
  const existing = await getUserById(id);
  if (existing) {
    return existing;
  }

  // Create stub user - auth service is source of truth for email/password
  return await db
    .insertInto('User')
    .values({ id, email: '', password_hash: '' })
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function getUserById(id: string): Promise<UserRow | undefined> {
  return await db
    .selectFrom('User')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst();
}

export async function getUserByEmail(email: string): Promise<UserRow | undefined> {
  return await db
    .selectFrom('User')
    .selectAll()
    .where('email', '=', email)
    .executeTakeFirst();
}

export async function emailExists(email: string): Promise<boolean> {
  const result = await db
    .selectFrom('User')
    .select(db.fn.countAll<number>().as('count'))
    .where('email', '=', email)
    .executeTakeFirst();
  return (result?.count ?? 0) > 0;
}
