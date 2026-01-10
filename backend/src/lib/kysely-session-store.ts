import type { Kysely } from 'kysely';
import type { SessionStore } from '@fastify/session';
import type { Session } from 'fastify';
import type { Database } from '../types/database';

export class KyselySessionStore implements SessionStore {
  private db: Kysely<Database>;
  private ttl: number;

  constructor(db: Kysely<Database>, ttl: number = 60 * 60 * 24 * 7) {
    this.db = db;
    this.ttl = ttl * 1000;
  }

  get(
    sessionId: string,
    callback: (err: any, session?: Session | null) => void
  ): void {
    this.db
      .selectFrom('Session')
      .selectAll()
      .where('id', '=', sessionId)
      .executeTakeFirst()
      .then((session) => {
        if (!session) {
          return callback(null, null);
        }

        // Check if expired
        if (new Date() > new Date(session.expires_at)) {
          this.destroy(sessionId, () => {});
          return callback(null, null);
        }

        const sessionData = session.data ? JSON.parse(session.data) : null;
        callback(null, sessionData);
      })
      .catch((error) => {
        callback(error);
      });
  }

  set(
    sessionId: string,
    session: Session,
    callback: (err?: any) => void
  ): void {
    const userId = (session as any).userId;
    const expires = session.cookie.expires;
    const expiresAt = expires
      ? new Date(expires).toISOString()
      : new Date(Date.now() + this.ttl).toISOString();

    this.db
      .insertInto('Session')
      .values({
        id: sessionId,
        user_id: userId || 1,
        data: JSON.stringify(session),
        expires_at: expiresAt,
      })
      .onConflict((oc) =>
        oc.column('id').doUpdateSet({
          data: JSON.stringify(session),
          expires_at: expiresAt,
          last_activity_at: new Date().toISOString(),
        })
      )
      .execute()
      .then(() => {
        callback();
      })
      .catch((error) => {
        callback(error);
      });
  }

  destroy(sessionId: string, callback: (err?: any) => void): void {
    this.db
      .deleteFrom('Session')
      .where('id', '=', sessionId)
      .execute()
      .then(() => {
        callback();
      })
      .catch((error) => {
        callback(error);
      });
  }
}
