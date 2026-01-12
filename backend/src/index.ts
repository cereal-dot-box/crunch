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

  // Start server
  const port = parseInt(env.PORT);
  await app.listen({ port, host: '0.0.0.0' });

  console.log(`\nCrunch backend running on http://localhost:${port}`);
  console.log(`Environment: ${env.NODE_ENV}`);
  console.log(`Auth service: ${process.env.AUTH_SERVICE_URL || 'http://localhost:4000'}\n`);

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
