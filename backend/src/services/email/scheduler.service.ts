import cron, { ScheduledTask } from 'node-cron';
import { EmailSyncService } from './sync.service';
import { getEnv } from '../../config/env';
import { db } from '../../lib/database';

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
      console.log('[EmailScheduler] Email sync is disabled in config');
      return;
    }

    const intervalMinutes = env.EMAIL_SYNC_INTERVAL_MINUTES || 5;
    const cronExpression = `*/${intervalMinutes} * * * *`;

    console.log(`[EmailScheduler] Starting email sync scheduler (every ${intervalMinutes} minutes)`);

    // Main IMAP sync + processing task
    this.cronTask = cron.schedule(cronExpression, async () => {
      await this.runSync();
    });

    console.log('[EmailScheduler] Scheduler started successfully');

    // Run initial sync immediately
    await this.runSync();
  }

  async stop(): Promise<void> {
    if (this.cronTask) {
      this.cronTask.stop();
      this.cronTask = null;
      console.log('[EmailScheduler] Sync scheduler stopped');
    }
  }

  private async runSync(): Promise<void> {
    // Prevent overlapping runs
    if (this.isRunning) {
      console.log('[EmailScheduler] Sync already running, skipping this run');
      return;
    }

    this.isRunning = true;

    try {
      console.log('[EmailScheduler] Starting scheduled sync...');

      // Get all active sync sources
      const sources = await this.getAllActiveSyncSources();

      if (sources.length === 0) {
        console.log('[EmailScheduler] No active sync sources found');
        return;
      }

      console.log(`[EmailScheduler] Syncing ${sources.length} sync sources`);

      // Sync each source individually
      for (const source of sources) {
        try {
          const result = await this.syncService.syncAndProcessSyncSource(
            source.id,
            source.user_id
          );

          console.log(
            `[EmailScheduler] Sync source ${source.id} (User ${source.user_id}): ` +
            `${result.emailsFetched} fetched, ` +
            `${result.jobsEnqueued} jobs enqueued, ` +
            `${result.errors} errors (${result.duration}ms)`
          );
        } catch (error) {
          console.error(`[EmailScheduler] Failed to sync sync source ${source.id}:`, error);
        }
      }

      console.log('[EmailScheduler] Scheduled sync complete');
    } catch (error) {
      console.error('[EmailScheduler] Sync error:', error);
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
      console.error('[EmailScheduler] Error getting active sync sources:', error);
      return [];
    }
  }

  /**
   * Manually trigger a sync for a specific sync source
   */
  async triggerSync(syncSourceId: number, userId: number): Promise<void> {
    console.log(`[EmailScheduler] Manually triggering sync for sync source ${syncSourceId}`);
    const result = await this.syncService.syncAndProcessSyncSource(syncSourceId, userId);
    console.log(
      `[EmailScheduler] Manual sync complete: ` +
      `${result.emailsFetched} fetched, ` +
      `${result.jobsEnqueued} jobs enqueued, ` +
      `${result.errors} errors`
    );
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
