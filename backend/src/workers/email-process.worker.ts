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

/**
 * Process a single email from the queue
 * Parses the email content and creates transactions or balance updates
 */
export async function processEmailJob(
  job: Job<EmailProcessJobData>
): Promise<{ success: boolean; transactionCreated?: boolean; creditUpdate?: boolean; error?: string }> {
  const { syncSourceId, userId, message } = job.data;

  console.log(`[Worker] Processing email ${message.uid} for sync source ${syncSourceId}`);

  try {
    // Check if already successfully processed
    const alreadyProcessed = await ProcessedEmail.isProcessed(syncSourceId, message.uid);
    if (alreadyProcessed) {
      console.log(`[Worker] Email ${message.uid} already successfully processed, skipping`);
      return { success: true };
    }

    // Get sync source
    const source = await SyncSource.getById(syncSourceId, userId);
    if (!source) {
      throw new Error(`Sync source ${syncSourceId} not found`);
    }

    // Get parser directly by bank, accountType, and syncSourceType
    const parserService = getEmailParserService();
    const parser = parserService.getParserFor(
      source.bank ?? '',
      source.accountType ?? '',
      source.type
    );

    if (!parser) {
      throw new Error(`No parser available for ${source.bank}:${source.accountType}:${source.type}`);
    }

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

    const parseResult = parser.parse(emailData);

    if (!parseResult) {
      throw new Error(`Parser failed for ${source.bank}:${source.accountType}:${source.type}`);
    }

    // Mark email as processed ONLY on success
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
      console.log('[Worker] Creating transaction with params:', JSON.stringify(createParams, null, 2));
      await Transaction.create(createParams);

      console.log(
        `[Worker] ✅ Created transaction: ${transaction.merchant} $${Math.abs(transaction.amount).toFixed(2)}`
      );

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

      console.log(
        `[Worker] ✅ Updated credit: $${creditUpdate.availableCredit.toFixed(2)}`
      );

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
      console.log(`[Worker] Adding DLQ entry for failed email ${message.uid} (after ${attemptsMade} attempts)`);
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
        console.log(`[Worker] ✅ DLQ entry created for email ${message.uid}`);
      } catch (dlqError) {
        console.error('[Worker] Failed to create DLQ entry:', dlqError);
      }
    } else {
      console.log(`[Worker] Email ${message.uid} failed (attempt ${attemptsMade}/${maxAttempts}): ${errorMessage}`);
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
    console.log(`[Worker] Job ${job.id} completed:`, result);
  });

  worker.on('failed', (job, err) => {
    console.error(`[Worker] Job ${job?.id} failed:`, err.message);
  });

  worker.on('error', (err) => {
    console.error('[Worker] Worker error:', err);
  });

  console.log('[Worker] Email process worker started');

  return worker;
}
