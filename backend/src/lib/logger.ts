import pino from 'pino';
import { getEnv } from '../config/env';

// Create base logger instance
const createLogger = () => {
  const env = getEnv();

  return pino({
    level: env.NODE_ENV === 'development' ? 'debug' : 'info',
    transport: env.NODE_ENV === 'development' ? {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname,module',
        messageFormat: '{if module}[{module}] {end}{msg}',
      },
    } : undefined,
  });
};

// Lazy initialization to avoid calling getEnv() before loadEnv()
let _logger: pino.Logger | null = null;

const getLogger = (): pino.Logger => {
  if (!_logger) {
    _logger = createLogger();
  }
  return _logger;
};

// Export a proxy that lazily initializes the logger
export const logger = new Proxy({} as pino.Logger, {
  get(_, prop: keyof pino.Logger) {
    return getLogger()[prop];
  },
});

// Create a child logger for a specific module
export const createModuleLogger = (module: string): pino.Logger => {
  return getLogger().child({ module });
};

// Pre-configured module loggers for common use cases
export const loggers = {
  get database() { return createModuleLogger('Database'); },
  get redis() { return createModuleLogger('Redis'); },
  get email() { return createModuleLogger('EmailSync'); },
  get scheduler() { return createModuleLogger('Scheduler'); },
  get worker() { return createModuleLogger('Worker'); },
  get queue() { return createModuleLogger('Queue'); },
  get imap() { return createModuleLogger('IMAP'); },
  get graphql() { return createModuleLogger('GraphQL'); },
  get parser() { return createModuleLogger('Parser'); },
  get http() { return createModuleLogger('HTTP'); },
  get server() { return createModuleLogger('Server'); },
  get config() { return createModuleLogger('Config'); },
  get mcp() { return createModuleLogger('MCP'); },
};
