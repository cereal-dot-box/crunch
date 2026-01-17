/**
 * Simple console-based logger for the parsers package
 * Provides a compatible interface with the backend's pino logger
 */

interface Logger {
  debug(msg: string): void;
  debug(obj: unknown, msg: string): void;
  trace(msg: string): void;
  trace(obj: unknown, msg: string): void;
  warn(msg: string): void;
  warn(obj: unknown, msg: string): void;
  error(msg: string): void;
  error(obj: unknown, msg: string): void;
}

class ConsoleLogger implements Logger {
  private prefix: string;

  constructor(prefix: string) {
    this.prefix = prefix;
  }

  debug(arg1: unknown, arg2?: string): void {
    if (typeof arg1 === 'string' && arg2 === undefined) {
      console.log(`[${this.prefix}] ${arg1}`);
    } else {
      console.log(`[${this.prefix}] ${arg2}`, arg1);
    }
  }

  trace(arg1: unknown, arg2?: string): void {
    if (typeof arg1 === 'string' && arg2 === undefined) {
      console.log(`[${this.prefix}] ${arg1}`);
    } else {
      console.log(`[${this.prefix}] ${arg2}`, arg1);
    }
  }

  warn(arg1: unknown, arg2?: string): void {
    if (typeof arg1 === 'string' && arg2 === undefined) {
      console.warn(`[${this.prefix}] ${arg1}`);
    } else {
      console.warn(`[${this.prefix}] ${arg2}`, arg1);
    }
  }

  error(arg1: unknown, arg2?: string): void {
    if (typeof arg1 === 'string' && arg2 === undefined) {
      console.error(`[${this.prefix}] ${arg1}`);
    } else {
      console.error(`[${this.prefix}] ${arg2}`, arg1);
    }
  }
}

// Export loggers object with a parser getter
export const loggers = {
  get parser(): Logger {
    return new ConsoleLogger('Parser');
  },
};
