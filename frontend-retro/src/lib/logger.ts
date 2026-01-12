import log from 'loglevel';

// Set default level based on environment
const isDev = import.meta.env.DEV;
log.setLevel(isDev ? 'debug' : 'warn');

// Create a child logger for a specific module
export const createModuleLogger = (module: string) => {
  const moduleLogger = log.getLogger(module);
  moduleLogger.setLevel(isDev ? 'debug' : 'warn');

  // Return a wrapper that prefixes messages with module name
  return {
    trace: (...args: unknown[]) => moduleLogger.trace(`[${module}]`, ...args),
    debug: (...args: unknown[]) => moduleLogger.debug(`[${module}]`, ...args),
    info: (...args: unknown[]) => moduleLogger.info(`[${module}]`, ...args),
    warn: (...args: unknown[]) => moduleLogger.warn(`[${module}]`, ...args),
    error: (...args: unknown[]) => moduleLogger.error(`[${module}]`, ...args),
    setLevel: moduleLogger.setLevel.bind(moduleLogger),
    getLevel: moduleLogger.getLevel.bind(moduleLogger),
  };
};

// Pre-configured module loggers for common use cases
export const loggers = {
  auth: createModuleLogger('Auth'),
  api: createModuleLogger('API'),
  router: createModuleLogger('Router'),
  ui: createModuleLogger('UI'),
  query: createModuleLogger('Query'),
};

// Export the root logger for general use
export const logger = {
  trace: log.trace.bind(log),
  debug: log.debug.bind(log),
  info: log.info.bind(log),
  warn: log.warn.bind(log),
  error: log.error.bind(log),
  setLevel: log.setLevel.bind(log),
  getLevel: log.getLevel.bind(log),
};

export default logger;
