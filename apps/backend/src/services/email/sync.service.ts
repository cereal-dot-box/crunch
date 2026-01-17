import { ImapService } from './imap.service';
import { SyncSource } from '../../models/sync-source';
import { ProcessedEmail } from '../../models/processed-emails';
import { EmailAlertDLQ } from '../../models/email-alert-dlq';
import { getEmailProcessQueue } from '../../queues/definitions';
import type { EmailProcessJobData } from '../../queues/job-types';
import { loggers } from '../../lib/logger';

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
   * Sync emails from a SyncSource's IMAP and enqueue processing jobs
   */
  async syncAndProcessSyncSource(
    syncSourceId: number,
    userId: string
  ): Promise<SyncResult> {
    const startTime = Date.now();

    log.info({ syncSourceId }, 'Starting sync for sync source');

    const result: SyncResult = {
      syncSourceName: `Source ${syncSourceId}`,
      emailsFetched: 0,
      jobsEnqueued: 0,
      errors: 0,
      duration: 0,
    };

    try {
      const source = await SyncSource.getById(syncSourceId, userId);
      if (!source) {
        throw new Error(`Sync source ${syncSourceId} not found`);
      }

      const syncSource = source.toJSON();
      result.syncSourceName = syncSource.name;

      // Get already processed message UIDs to skip them
      const processedUids = await ProcessedEmail.getMessageUids(syncSourceId);
      const processedUidsSet = new Set(processedUids);

      // Get DLQ message UIDs to skip them (emails that already failed)
      const dlqUids = await EmailAlertDLQ.getMessageUids(userId);
      const dlqUidsSet = new Set(dlqUids);

      log.debug({ processedCount: processedUids.length, dlqCount: dlqUidsSet.size }, 'Skipping already processed/failed emails');

      // Connect to IMAP and fetch emails
      const imapService = new ImapService(syncSource);
      await imapService.connect();

      const emails = await imapService.fetchNewEmails();
      result.emailsFetched = emails.length;

      log.debug({ count: emails.length }, 'Fetched emails from IMAP');

      if (emails.length === 0) {
        await imapService.disconnect();
        result.duration = Date.now() - startTime;
        return result;
      }

      const queue = getEmailProcessQueue();

      // Process each email: check if already processed, enqueue if not
      for (const email of emails) {
        const uid = email.uid.toString();

        try {
          // Skip if already processed
          if (processedUidsSet.has(uid)) {
            log.trace({ uid }, 'Email already processed, skipping');
            continue;
          }

          // Skip if there's a DLQ entry (already failed after retries)
          if (dlqUidsSet.has(uid)) {
            log.trace({ uid }, 'Email already in DLQ, skipping');
            continue;
          }

          // Enqueue processing job
          const jobData: EmailProcessJobData = {
            syncSourceId: syncSourceId,
            userId,
            message: {
              uid,
              subject: email.subject,
              from: email.from,
              date: email.date.toISOString(),
              bodyText: email.textBody,
              bodyHtml: email.htmlBody || undefined,
            },
          };

          await queue.add(`process-${syncSourceId}-${uid}`, jobData, {
            jobId: `process-${syncSourceId}-${uid}`, // Dedupe by UID
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 2000,
            },
          });

          result.jobsEnqueued++;

          log.debug({ uid }, 'Enqueued job for email');
        } catch (error) {
          log.error({ err: error, uid }, 'Error queuing email');
          result.errors++;
        }
      }

      await imapService.disconnect();

      // Update last_synced_at timestamp
      await SyncSource.updateLastSynced(syncSourceId);

      result.duration = Date.now() - startTime;

      log.info({
        emailsFetched: result.emailsFetched,
        jobsEnqueued: result.jobsEnqueued,
        errors: result.errors,
        durationMs: result.duration,
      }, 'Sync complete');

      return result;
    } catch (error) {
      result.duration = Date.now() - startTime;
      log.error({ err: error, syncSourceId }, 'Sync failed for source');
      throw error;
    }
  }

  /**
   * Sync a specific sync source
   */
  async syncSyncSource(
    syncSourceId: number,
    userId: string
  ): Promise<SyncResult> {
    return await this.syncAndProcessSyncSource(syncSourceId, userId);
  }

  /**
   * Get queue stats for monitoring
   */
  async getQueueStats(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
  }> {
    const { getQueueStats } = await import('../../queues/definitions');
    return await getQueueStats('email-process');
  }
}
