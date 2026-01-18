import cron, { ScheduledTask } from 'node-cron';
import { EmailSyncService } from './sync.service';
import { loggers } from '../../lib/logger';
import type { SyncSourceConfig } from '../../config/rest-client';

const log = loggers.scheduler;

export class EmailSchedulerService {
  private syncService: EmailSyncService;
  private cronTask: ScheduledTask | null = null;
  private isRunning: boolean = false;

  constructor() {
    this.syncService = new EmailSyncService();
  }

  async start(): Promise<void> {
    const { getEnv } = await import('../../config/env');
    const env = getEnv();

    if (!env.EMAIL_SYNC_ENABLED) {
      log.info('Email sync is disabled in config');
      return;
    }

    const intervalMinutes = env.EMAIL_SYNC_INTERVAL_MINUTES || 5;
    const cronExpression = `*/${intervalMinutes} * * * *`;

    log.info({ intervalMinutes }, 'Starting email sync scheduler');

    // Main IMAP sync task (fetch and log only, no processing)
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

      // Get all active sync sources via GraphQL
      const sources = await this.getAllActiveSyncSources();

      if (sources.length === 0) {
        log.debug('No active sync sources found');
        return;
      }

      log.info({ count: sources.length }, 'Syncing sync sources');

      // Sync each source individually
      for (const source of sources) {
        try {
          const result = await this.syncService.syncAndProcessSyncSource(source);

          log.info({
            syncSourceId: source.id,
            userId: source.userId,
            emailsFetched: result.emailsFetched,
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

  private async getAllActiveSyncSources(): Promise<SyncSourceConfig[]> {
    try {
      const { getActiveSyncSources } = await import('../../config/rest-client');
      return await getActiveSyncSources();
    } catch (error) {
      log.error({ err: error }, 'Error getting active sync sources from REST API');
      return [];
    }
  }

  /**
   * Manually trigger a sync for a specific sync source
   */
  async triggerSync(syncSourceId: number, userId: string): Promise<void> {
    log.info({ syncSourceId }, 'Manually triggering sync');

    // Fetch the specific sync source via REST API
    const { getSyncSource } = await import('../../config/rest-client');
    const source = await getSyncSource(syncSourceId, userId);

    if (!source) {
      throw new Error(`Sync source ${syncSourceId} not found`);
    }

    const result = await this.syncService.syncAndProcessSyncSource(source);
    log.info({
      emailsFetched: result.emailsFetched,
      durationMs: result.duration,
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
