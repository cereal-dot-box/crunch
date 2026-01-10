import Fastify from 'fastify';
import fastifyCookie from '@fastify/cookie';
import fastifySession from '@fastify/session';
import fastifyCors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import mercurius from 'mercurius';
import mercuriusLogging from 'mercurius-logging';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { loadEnv, getEnv } from './config/env';
import { connectDatabase, disconnectDatabase, db } from './lib/database';
import { errorHandler } from './middleware/error.middleware';
import { KyselySessionStore } from './lib/kysely-session-store';
import { resolvers } from './graphql/resolvers';
import { getEmailScheduler } from './services/email/scheduler.service';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import routes
import { authRoutes } from './routes/auth.routes';

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

  // Register session plugin with Kysely store
  await app.register(fastifySession, {
    store: new KyselySessionStore(db),
    secret: env.SESSION_SECRET,
    cookie: {
      secure: env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 * 1000, // 7 days in milliseconds
    },
    saveUninitialized: false,
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
    context: (request) => ({
      userId: request.session.userId,
    }),
    graphiql: env.NODE_ENV === 'development',
  });

  // Register mercurius-logging to log GraphQL operations
  await app.register(mercuriusLogging);

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

  // Health check
  app.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // Register ONLY auth routes
  await app.register(authRoutes, { prefix: '/api/auth' });

  // Start server
  const port = parseInt(env.PORT);
  await app.listen({ port, host: '0.0.0.0' });

  console.log(`\n🚀 Crunch backend running on http://localhost:${port}`);
  console.log(`📊 Environment: ${env.NODE_ENV}\n`);

  // Start email sync scheduler in background (non-blocking)
  const emailScheduler = getEmailScheduler();
  emailScheduler.start().catch((error) => {
    console.error('Email scheduler failed to start:', error);
  });

  // Shutdown handler
  const shutdown = async () => {
    console.log('Shutting down...');
    await emailScheduler.stop();
    await disconnectDatabase();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
