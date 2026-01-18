import { ImapService } from './imap.service';
import { loggers } from '../../lib/logger';
import type { SyncSourceConfig } from '../../config/rest-client';
import { getEmailProcessQueue } from '../../queues/definitions';

const log = loggers.email;

export interface SyncResult {
  syncSourceName: string;
  emailsFetched: number;
  jobsEnqueued: number;
  errors: number;
  duration: number;
}

export class EmailSyncService {
  /**
   * Sync emails from a SyncSource's IMAP and enqueue for processing
   */
  async syncAndProcessSyncSource(
    syncSourceConfig: SyncSourceConfig
  ): Promise<SyncResult> {
    const startTime = Date.now();

    log.info({ syncSourceId: syncSourceConfig.id }, 'Starting sync for sync source');

    const result: SyncResult = {
      syncSourceName: syncSourceConfig.name,
      emailsFetched: 0,
      jobsEnqueued: 0,
      errors: 0,
      duration: 0,
    };

    try {
      // Connect to IMAP and fetch emails
      const imapService = new ImapService(syncSourceConfig);
      await imapService.connect();

      const emails = await imapService.fetchNewEmails();
      result.emailsFetched = emails.length;

      log.debug({ count: emails.length }, 'Fetched emails from IMAP');

      if (emails.length === 0) {
        await imapService.disconnect();
        result.duration = Date.now() - startTime;
        return result;
      }

      // Enqueue each email for processing
      const queue = getEmailProcessQueue();

      for (const email of emails) {
        try {
          await queue.add(
            `email-${email.uid}`,
            {
              syncSourceId: syncSourceConfig.id,
              userId: syncSourceConfig.userId,
              message: {
                uid: email.uid.toString(),
                subject: email.subject,
                from: email.from,
                date: email.date.toISOString(),
                bodyText: email.textBody,
                bodyHtml: email.htmlBody,
              },
            },
            {
              jobId: `${syncSourceConfig.id}-${email.uid}`,
            }
          );
          result.jobsEnqueued++;
        } catch (error) {
          log.error({ err: error, uid: email.uid }, 'Failed to enqueue email');
          result.errors++;
        }
      }

      await imapService.disconnect();
      result.duration = Date.now() - startTime;

      log.info({
        emailsFetched: result.emailsFetched,
        jobsEnqueued: result.jobsEnqueued,
        errors: result.errors,
        durationMs: result.duration,
      }, 'Sync complete (jobs enqueued)');

      return result;
    } catch (error) {
      result.duration = Date.now() - startTime;
      log.error({ err: error, syncSourceId: syncSourceConfig.id }, 'Sync failed for source');
      throw error;
    }
  }

  /**
   * Sync a specific sync source
   */
  async syncSyncSource(
    syncSourceConfig: SyncSourceConfig
  ): Promise<SyncResult> {
    return await this.syncAndProcessSyncSource(syncSourceConfig);
  }
}

// Re-export SyncSourceConfig for convenience
export type { SyncSourceConfig } from '../../config/rest-client';
