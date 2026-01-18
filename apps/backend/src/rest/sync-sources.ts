import { FastifyInstance } from 'fastify';
import { verifyServiceToken, extractToken } from '../lib/jwks';
import { loggers } from '../lib/logger';

const log = loggers.http;

// Authentication middleware for sync-sources routes
async function authenticate(request: any, reply: any) {
  const token = extractToken(request.headers.authorization);

  if (!token) {
    return reply.code(401).send({ error: 'Unauthorized' });
  }

  try {
    await verifyServiceToken(token);
  } catch {
    return reply.code(401).send({ error: 'Unauthorized' });
  }
}

export async function syncSourcesRoutes(app: FastifyInstance) {
  // Add authentication hook for all sync-sources routes
  app.addHook('onRequest', authenticate);
  // GET /api/sync-sources/active - returns all active sync sources
  app.get('/active', async (_request, reply) => {
    try {
      const { db } = await import('../lib/database');

      const sources = await db
        .selectFrom('SyncSource')
        .innerJoin('Account', 'Account.id', 'SyncSource.account_id')
        .select([
          'SyncSource.id',
          'SyncSource.name',
          'SyncSource.bank',
          'SyncSource.account_type as accountType',
          'SyncSource.account_id as accountId',
          'SyncSource.email_address as emailAddress',
          'SyncSource.imap_host as imapHost',
          'SyncSource.imap_port as imapPort',
          'SyncSource.imap_password_encrypted as imapPasswordEncrypted',
          'SyncSource.imap_folder as imapFolder',
          'SyncSource.last_processed_uid as lastProcessedUid',
          'Account.user_id as userId',
        ])
        .where('SyncSource.status', '=', 'active')
        .where('SyncSource.is_active', '=', 1)
        .where('Account.is_active', '=', 1)
        .execute();

      return reply.send({ sources });
    } catch (error) {
      log.error({ err: error }, 'Error fetching active sync sources');
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // GET /api/sync-sources/:id - returns single sync source
  app.get<{ Params: { id: string }; Querystring: { userId: string } }>('/:id', async (request, reply) => {
    try {
      const { db } = await import('../lib/database');

      const { userId } = request.query;
      const id = parseInt(request.params.id, 10);

      if (!userId) {
        return reply.code(400).send({ error: 'userId query parameter is required' });
      }

      const source = await db
        .selectFrom('SyncSource')
        .innerJoin('Account', 'Account.id', 'SyncSource.account_id')
        .select([
          'SyncSource.id',
          'SyncSource.name',
          'SyncSource.bank',
          'SyncSource.account_type as accountType',
          'SyncSource.account_id as accountId',
          'SyncSource.email_address as emailAddress',
          'SyncSource.imap_host as imapHost',
          'SyncSource.imap_port as imapPort',
          'SyncSource.imap_password_encrypted as imapPasswordEncrypted',
          'SyncSource.imap_folder as imapFolder',
          'SyncSource.last_processed_uid as lastProcessedUid',
          'Account.user_id as userId',
        ])
        .where('SyncSource.id', '=', id)
        .where('Account.user_id', '=', userId)
        .executeTakeFirst();

      if (!source) {
        return reply.code(404).send({ error: 'Sync source not found' });
      }

      return reply.send({ source });
    } catch (error) {
      log.error({ err: error }, 'Error fetching sync source');
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
}
