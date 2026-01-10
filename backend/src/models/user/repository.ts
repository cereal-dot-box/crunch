import { db } from '../../lib/database';
import type { UserRow, CreateUserParams } from './types';

export async function createUser(params: CreateUserParams): Promise<UserRow> {
  return await db
    .insertInto('User')
    .values({ email: params.email, password_hash: params.passwordHash })
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function getUserById(id: number): Promise<UserRow | undefined> {
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
