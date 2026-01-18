import pino from 'pino';
import { getEnv } from '../config/env';

// Create base logger instance
const createLogger = () => {
  const env = getEnv();

  return pino({
    level: env.LOG_LEVEL,
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
  get worker() { return createModuleLogger('Worker'); },
  get graphql() { return createModuleLogger('GraphQL'); },
  get parser() { return createModuleLogger('Parser'); },
  get redis() { return createModuleLogger('Redis'); },
  get queue() { return createModuleLogger('Queue'); },
};
