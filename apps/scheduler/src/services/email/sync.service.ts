import { ImapService } from './imap.service';
import { loggers } from '../../lib/logger';
import type { SyncSourceConfig } from '../../config/backend-client';

const log = loggers.email;

export interface SyncResult {
  syncSourceName: string;
  emailsFetched: number;
  jobsEnqueued: number;  // Always 0 for scheduler-only mode
  errors: number;
  duration: number;
}

export class EmailSyncService {
  /**
   * Sync emails from a SyncSource's IMAP and log them (no processing)
   */
  async syncAndProcessSyncSource(
    syncSourceConfig: SyncSourceConfig
  ): Promise<SyncResult> {
    const startTime = Date.now();

    log.info({ syncSourceId: syncSourceConfig.id }, 'Starting sync for sync source');

    const result: SyncResult = {
      syncSourceName: syncSourceConfig.name,
      emailsFetched: 0,
      jobsEnqueued: 0,  // No jobs enqueued in scheduler-only mode
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

      // Log each email instead of enqueuing for processing
      for (const email of emails) {
        try {
          log.info({
            syncSourceId: syncSourceConfig.id,
            uid: email.uid,
            subject: email.subject,
            from: email.from,
            date: email.date,
            textBodyLength: email.textBody.length,
            hasHtmlBody: !!email.htmlBody,
          }, 'Fetched email from IMAP (not processing)');
        } catch (error) {
          log.error({ err: error, uid: email.uid }, 'Error logging email');
          result.errors++;
        }
      }

      await imapService.disconnect();
      result.duration = Date.now() - startTime;

      log.info({
        emailsFetched: result.emailsFetched,
        errors: result.errors,
        durationMs: result.duration,
      }, 'Sync complete (emails logged, not processed)');

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
export type { SyncSourceConfig } from '../../config/backend-client';
