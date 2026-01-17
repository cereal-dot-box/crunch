import { Kysely, Migrator, FileMigrationProvider } from 'kysely';
import { LibsqlDialect } from '@libsql/kysely-libsql';
import { createClient } from '@libsql/client';
import * as path from 'path';
import { promises as fs } from 'fs';
import type { Database } from '../types/database';
import { getEnv } from '../config/env';
import { loggers } from './logger';

const env = getEnv();

// Create libsql client
const client = createClient({
  url: env.DATABASE_URL,
});

// Create Kysely instance
export const db = new Kysely<Database>({
  dialect: new LibsqlDialect({ client }),
});

// Create migrator
export const migrator = new Migrator({
  db,
  provider: new FileMigrationProvider({
    fs,
    path,
    migrationFolder: path.join(__dirname, '../migrations'),
  }),
});

// Database lifecycle functions
export async function connectDatabase() {
  try {
    // Enable WAL mode for better concurrency (allows concurrent readers and writers)
    await client.execute('PRAGMA journal_mode=WAL');
    // Set busy timeout to 5 seconds - retry for up to 5s before returning SQLITE_BUSY
    await client.execute('PRAGMA busy_timeout=5000');

    // Run migrations
    const { error, results } = await migrator.migrateToLatest();

    if (error) {
      loggers.database.error({ err: error }, 'Migration failed');
      process.exit(1);
    }

    results?.forEach((result) => {
      if (result.status === 'Success') {
        loggers.database.info(`Migration "${result.migrationName}" executed`);
      } else if (result.status === 'Error') {
        loggers.database.error(`Migration "${result.migrationName}" failed`);
      }
    });

    loggers.database.info('Database connected');
  } catch (error) {
    loggers.database.error({ err: error }, 'Database connection failed');
    process.exit(1);
  }
}

export async function disconnectDatabase() {
  await db.destroy();
}
