import { Worker, Job } from 'bullmq';
import { getRedis } from '../config/redis';
import { getEmailParserService } from '../services/email/parser.service';
import { ProcessedEmail } from '../models/processed-emails';
import { EmailAlertDLQ } from '../models/email-alert-dlq';
import { SyncSource } from '../models/sync-source';
import { Transaction } from '../models/transaction';
import { BalanceUpdate } from '../models/balance-update';
import type { DLQErrorType } from '../models/email-alert-dlq';
import type { EmailProcessJobData } from '../queues/job-types';
import { QUEUE_NAMES } from '../queues/job-types';
import { loggers } from '../lib/logger';

const log = loggers.worker;

/**
 * Process a single email from the queue
 * Parses the email content and creates transactions or balance updates
 */
export async function processEmailJob(
  job: Job<EmailProcessJobData>
): Promise<{ success: boolean; transactionCreated?: boolean; creditUpdate?: boolean; error?: string }> {
  const { syncSourceId, userId, message } = job.data;

  log.debug({ uid: message.uid, syncSourceId }, 'Processing email');

  try {
    // Check if already successfully processed
    const alreadyProcessed = await ProcessedEmail.isProcessed(syncSourceId, message.uid);
    if (alreadyProcessed) {
      log.debug({ uid: message.uid }, 'Email already processed, skipping');
      return { success: true };
    }

    // Get sync source
    const source = await SyncSource.getById(syncSourceId, userId);
    if (!source) {
      throw new Error(`Sync source ${syncSourceId} not found`);
    }

    // Create email data object for parser detection
    const emailData = {
      message_uid: message.uid,
      subject: message.subject,
      from_address: message.from,
      date: message.date,
      body_text: message.bodyText,
      body_html: message.bodyHtml ?? null,
      alert_type: 'UNKNOWN' as const,
      user_id: userId,
      sync_source_id: syncSourceId,
      created_at: message.date,
    };

    // Use content-based parser detection
    const parserService = getEmailParserService();
    const parser = parserService.getParser(emailData);

    if (!parser) {
      console.log(message.bodyText)
      throw new Error(`No parser available for this email type`);
    }

    const parseResult = parser.parse(emailData);

    if (!parseResult) {
      throw new Error(`Parser failed for ${source.bank}:${source.accountType}`);
    }

    // Handle unhandled email types by adding to DLQ
    if (parseResult.type === 'payment' || parseResult.type === 'unknown') {
      log.warn({ uid: message.uid, type: parseResult.type }, 'Unhandled email type, adding to DLQ');
      await EmailAlertDLQ.create({
        userId,
        syncSourceId,
        messageUid: message.uid,
        subject: message.subject,
        fromAddress: message.from,
        date: message.date,
        bodyText: message.bodyText,
        bodyHtml: message.bodyHtml,
        errorMessage: `Unhandled email type: ${parseResult.type}`,
        errorType: 'UNSUPPORTED_TYPE' as DLQErrorType,
        errorStack: undefined,
      });
      log.info({ uid: message.uid, type: parseResult.type }, 'DLQ entry created for unhandled type');
      return { success: true };
    }

    // Mark email as processed ONLY on success (for handled types)
    const processedEmail = await ProcessedEmail.mark({
      userId,
      syncSourceId,
      messageUid: message.uid,
    });

    if (parseResult.type === 'transaction') {
      const transaction = parseResult.data;

      // Create transaction record using the sync source's linked account
      const createParams = {
        userId,
        accountId: source.accountId,
        syncSourceId: source.id,
        processedEmailId: processedEmail.id,
        amount: transaction.amount,
        transactionDate: transaction.date,
        name: transaction.merchant || 'Unknown Merchant',
        merchantName: transaction.merchant || null,
      };
      log.debug({ params: createParams }, 'Creating transaction');
      await Transaction.create(createParams);

      log.info({ merchant: transaction.merchant, amount: Math.abs(transaction.amount).toFixed(2) }, 'Created transaction');

      return { success: true, transactionCreated: true };
    } else if (parseResult.type === 'credit_update') {
      const creditUpdate = parseResult.data;

      // Create balance update record using the sync source's linked account
      await BalanceUpdate.create({
        userId,
        accountId: source.accountId,
        syncSourceId: source.id,
        processedEmailId: processedEmail.id,
        balanceType: 'available_balance',
        newBalance: creditUpdate.availableCredit,
        updateSource: 'email',
        sourceDetail: source.name.toLowerCase(),
        updateDate: message.date,
      });

      log.info({ availableCredit: creditUpdate.availableCredit.toFixed(2) }, 'Updated credit');

      return { success: true, creditUpdate: true };
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const maxAttempts = job.opts.attempts || 3;

    // job.attemptsMade can be inconsistent, use the actual count from the job
    const attemptsMade = (job.attemptsMade ?? 0) + 1;

    if (attemptsMade >= maxAttempts) {
      // Create DLQ entry after all BullMQ retries are exhausted (for manual review)
      log.warn({ uid: message.uid, attempts: attemptsMade }, 'Adding DLQ entry for failed email');
      try {
        await EmailAlertDLQ.create({
          userId,
          syncSourceId,
          messageUid: message.uid,
          subject: message.subject,
          fromAddress: message.from,
          date: message.date,
          bodyText: message.bodyText,
          bodyHtml: message.bodyHtml,
          errorMessage,
          errorType: 'PARSE_ERROR' as DLQErrorType,
          errorStack: error instanceof Error ? error.stack : undefined,
        });
        log.info({ uid: message.uid }, 'DLQ entry created');
      } catch (dlqError) {
        log.error({ err: dlqError }, 'Failed to create DLQ entry');
      }
    } else {
      log.warn({ uid: message.uid, attempt: attemptsMade, maxAttempts, error: errorMessage }, 'Email processing failed');
    }

    // Throw the error so BullMQ can retry
    throw error;
  }
}

/**
 * Create the email process worker
 */
export function createEmailProcessWorker(): Worker<EmailProcessJobData> {
  const redis = getRedis();

  const worker = new Worker<EmailProcessJobData>(
    QUEUE_NAMES.EMAIL_PROCESS,
    async (job) => {
      const result = await processEmailJob(job);
      return result;
    },
    {
      connection: redis,
      concurrency: 5, // Process up to 5 emails concurrently
      limiter: {
        max: 100, // Max 100 jobs per window
        duration: 60000, // Per 60 seconds
      },
    }
  );

  worker.on('completed', (job, result) => {
    log.debug({ jobId: job.id, result }, 'Job completed');
  });

  worker.on('failed', (job, err) => {
    log.error({ jobId: job?.id, error: err.message }, 'Job failed');
  });

  worker.on('error', (err) => {
    log.error({ err }, 'Worker error');
  });

  log.info('Email process worker started');

  return worker;
}
