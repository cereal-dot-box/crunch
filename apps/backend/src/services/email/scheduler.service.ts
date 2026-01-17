import cron, { ScheduledTask } from 'node-cron';
import { EmailSyncService } from './sync.service';
import { getEnv } from '../../config/env';
import { db } from '../../lib/database';
import { loggers } from '../../lib/logger';

const log = loggers.scheduler;

export class EmailSchedulerService {
  private syncService: EmailSyncService;
  private cronTask: ScheduledTask | null = null;
  private isRunning: boolean = false;

  constructor() {
    this.syncService = new EmailSyncService();
  }

  async start(): Promise<void> {
    const env = getEnv();

    if (!env.EMAIL_SYNC_ENABLED) {
      log.info('Email sync is disabled in config');
      return;
    }

    const intervalMinutes = env.EMAIL_SYNC_INTERVAL_MINUTES || 5;
    const cronExpression = `*/${intervalMinutes} * * * *`;

    log.info({ intervalMinutes }, 'Starting email sync scheduler');

    // Main IMAP sync + processing task
    this.cronTask = cron.schedule(cronExpression, async () => {
      await this.runSync();
    });

    log.info('Scheduler started successfully');

    // Run initial sync immediately
    await this.runSync();
  }

  async stop(): Promise<void> {
    if (this.cronTask) {
      this.cronTask.stop();
      this.cronTask = null;
      log.info('Sync scheduler stopped');
    }
  }

  private async runSync(): Promise<void> {
    // Prevent overlapping runs
    if (this.isRunning) {
      log.debug('Sync already running, skipping this run');
      return;
    }

    this.isRunning = true;

    try {
      log.debug('Starting scheduled sync...');

      // Get all active sync sources
      const sources = await this.getAllActiveSyncSources();

      if (sources.length === 0) {
        log.debug('No active sync sources found');
        return;
      }

      log.info({ count: sources.length }, 'Syncing sync sources');

      // Sync each source individually
      for (const source of sources) {
        try {
          const result = await this.syncService.syncAndProcessSyncSource(
            source.id,
            source.user_id
          );

          log.info({
            syncSourceId: source.id,
            userId: source.user_id,
            emailsFetched: result.emailsFetched,
            jobsEnqueued: result.jobsEnqueued,
            errors: result.errors,
            durationMs: result.duration,
          }, 'Sync source completed');
        } catch (error) {
          log.error({ err: error, syncSourceId: source.id }, 'Failed to sync sync source');
        }
      }

      log.debug('Scheduled sync complete');
    } catch (error) {
      log.error({ err: error }, 'Sync error');
    } finally {
      this.isRunning = false;
    }
  }

  private async getAllActiveSyncSources() {
    try {
      // Get all active sync sources across all users
      const sources = await db
        .selectFrom('SyncSource')
        .innerJoin('Account', 'Account.id', 'SyncSource.account_id')
        .select([
          'SyncSource.id',
          'SyncSource.status',
          'Account.user_id',
        ])
        .where('SyncSource.status', '=', 'active')
        .where('SyncSource.is_active', '=', 1)
        .where('Account.is_active', '=', 1)
        .execute();

      return sources;
    } catch (error) {
      log.error({ err: error }, 'Error getting active sync sources');
      return [];
    }
  }

  /**
   * Manually trigger a sync for a specific sync source
   */
  async triggerSync(syncSourceId: number, userId: number): Promise<void> {
    log.info({ syncSourceId }, 'Manually triggering sync');
    const result = await this.syncService.syncAndProcessSyncSource(syncSourceId, userId);
    log.info({
      emailsFetched: result.emailsFetched,
      jobsEnqueued: result.jobsEnqueued,
      errors: result.errors,
    }, 'Manual sync complete');
  }

  getStatus(): { running: boolean; scheduled: boolean } {
    return {
      running: this.isRunning,
      scheduled: this.cronTask !== null,
    };
  }
}

// Singleton instance
let schedulerInstance: EmailSchedulerService | null = null;

export function getEmailScheduler(): EmailSchedulerService {
  if (!schedulerInstance) {
    schedulerInstance = new EmailSchedulerService();
  }
  return schedulerInstance;
}
