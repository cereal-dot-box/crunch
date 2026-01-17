import Fastify from 'fastify';
import fastifyCookie from '@fastify/cookie';
import fastifyCors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import mercurius from 'mercurius';
import mercuriusLogging from 'mercurius-logging';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { loadEnv, getEnv } from './config/env';
import { connectDatabase, disconnectDatabase } from './lib/database';
import { errorHandler } from './middleware/error.middleware';
import { resolvers } from './graphql/resolvers';
import { getEmailScheduler } from './services/email/scheduler.service';
import { verifyServiceToken, extractToken } from './lib/jwks';
import { loggers } from './lib/logger';
import { registerMCPRoutes } from './mcp/index.js';

const log = loggers.server;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function start() {
  // Load and validate environment
  loadEnv();
  const env = getEnv();

  // Connect to database (runs migrations)
  await connectDatabase();

  // Initialize Fastify
  const app = Fastify({
    logger: {
      transport: env.NODE_ENV === 'development' ? {
        target: 'pino-pretty',
        options: {
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      } : undefined,
    },
    disableRequestLogging: true,
  });

  // Register plugins
  await app.register(fastifyCookie);

  // Register CORS first (before helmet)
  await app.register(fastifyCors, {
    origin: env.NODE_ENV === 'development'
      ? (origin, callback) => {
          // Allow localhost and local network in development
          if (!origin || origin.startsWith('http://localhost:') || origin.startsWith('http://192.168.')) {
            callback(null, true);
          } else {
            callback(new Error('Not allowed by CORS'), false);
          }
        }
      : true,
    credentials: true,
  });

  await app.register(fastifyHelmet, {
    contentSecurityPolicy: env.NODE_ENV === 'production' ? undefined : false,
  });

  // Register error handler
  app.setErrorHandler(errorHandler);

  // Register GraphQL with Mercurius
  const schemaPath = join(__dirname, 'graphql', 'schema.graphql');
  const schema = readFileSync(schemaPath, 'utf8');
  await app.register(mercurius, {
    schema,
    resolvers,
    context: async (request) => {
      // Extract and verify service JWT token
      const token = extractToken(request.headers.authorization);

      if (!token) {
        return { isAuthenticated: false };
      }

      try {
        const payload = await verifyServiceToken(token);
        return {
          isAuthenticated: true,
          serviceClient: payload.sub,
        };
      } catch {
        return { isAuthenticated: false };
      }
    },
    graphiql: env.NODE_ENV === 'development',
  });

  // Register mercurius-logging to log GraphQL operations
  await app.register(mercuriusLogging);

  // Register MCP routes
  await registerMCPRoutes(app);

  // Custom logging for non-GraphQL requests
  app.addHook('onRequest', async (request, reply) => {
    if (request.url !== '/graphql') {
      request.log.info({
        req: {
          method: request.method,
          url: request.url,
        },
      }, 'incoming request');
    }
  });

  app.addHook('onResponse', async (request, reply) => {
    if (request.url !== '/graphql') {
      request.log.info({
        res: {
          statusCode: reply.statusCode,
        },
      }, 'request completed');
    }
  });

  // REST endpoint for scheduler - active sync sources
  // No auth required for internal use
  app.get('/api/sync-sources/active', async (_request, reply) => {
    try {
      const { db } = await import('./lib/database');
      const { loggers } = await import('./lib/logger');
      const log = loggers.http;

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

  // REST endpoint for scheduler - single sync source (for manual sync)
  app.get<{ Querystring: { userId: string } }>('/api/sync-sources/:id', async (request, reply) => {
    try {
      const { db } = await import('./lib/database');
      const { loggers } = await import('./lib/logger');
      const log = loggers.http;

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

  // Health check
  app.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // Start server
  const port = parseInt(env.PORT);
  await app.listen({ port, host: '0.0.0.0' });

  log.info({ port, env: env.NODE_ENV, authService: process.env.AUTH_SERVICE_URL || 'http://localhost:4000' }, 'Crunch backend started');

  // Start email sync scheduler in background (non-blocking)
  const emailScheduler = getEmailScheduler();
  emailScheduler.start().catch((error) => {
    log.error({ err: error }, 'Email scheduler failed to start');
  });

  // Shutdown handler
  const shutdown = async () => {
    log.info('Shutting down...');
    await emailScheduler.stop();
    await disconnectDatabase();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start().catch((error) => {
  log.fatal({ err: error }, 'Failed to start server');
  process.exit(1);
});
