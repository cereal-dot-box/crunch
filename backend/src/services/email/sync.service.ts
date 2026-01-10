import { ImapService } from './imap.service';
import { SyncSource } from '../../models/sync-source';
import { ProcessedEmail } from '../../models/processed-emails';
import { EmailAlertDLQ } from '../../models/email-alert-dlq';
import { getEmailProcessQueue } from '../../queues/definitions';
import type { EmailProcessJobData } from '../../queues/job-types';

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
    userId: number
  ): Promise<SyncResult> {
    const startTime = Date.now();

    console.log(`[EmailSync] Starting sync for sync source ${syncSourceId}`);

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

      console.log(`[EmailSync] Skipping ${processedUids.length} processed emails and ${dlqUidsSet.size} failed emails`);

      // Connect to IMAP and fetch emails
      const imapService = new ImapService(syncSource);
      await imapService.connect();

      const emails = await imapService.fetchNewEmails();
      result.emailsFetched = emails.length;

      console.log(`[EmailSync] Fetched ${emails.length} emails from IMAP`);

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
            console.log(`[EmailSync] Email ${uid} already processed, skipping`);
            continue;
          }

          // Skip if there's a DLQ entry (already failed after retries)
          if (dlqUidsSet.has(uid)) {
            console.log(`[EmailSync] Email ${uid} already in DLQ (failed before), skipping`);
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

          console.log(`[EmailSync] Enqueued job for email ${uid}`);
        } catch (error) {
          console.error(`[EmailSync] Error queuing email ${uid}:`, error);
          result.errors++;
        }
      }

      await imapService.disconnect();

      // Update last_synced_at timestamp
      await SyncSource.updateLastSynced(syncSourceId);

      result.duration = Date.now() - startTime;

      console.log(
        `[EmailSync] Sync complete: ${result.emailsFetched} fetched, ${result.jobsEnqueued} enqueued, ${result.errors} errors (${result.duration}ms)`
      );

      return result;
    } catch (error) {
      result.duration = Date.now() - startTime;
      console.error(`[EmailSync] Sync failed for source ${syncSourceId}:`, error);
      throw error;
    }
  }

  /**
   * Sync a specific sync source
   */
  async syncSyncSource(
    syncSourceId: number,
    userId: number
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
