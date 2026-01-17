import { getGraphQLClient } from '../config/graphql';
import { getEmailParserService } from '../services/email/parser.service';
import * as queries from '../graphql/queries';
import * as mutations from '../graphql/mutations';
import { loggers } from '../lib/logger';

const log = loggers.worker;

export interface EmailProcessJobData {
  syncSourceId: number;
  userId: string;
  message: {
    uid: string;
    subject: string;
    from: string;
    date: string;
    bodyText: string;
    bodyHtml?: string;
  };
}

export interface EmailProcessResult {
  success: boolean;
  transactionCreated?: boolean;
  creditUpdate?: boolean;
  error?: string;
}

/**
 * Process a single email from the queue
 * Parses the email content and creates transactions or balance updates via GraphQL
 */
export async function processEmailJob(
  jobData: EmailProcessJobData
): Promise<EmailProcessResult> {
  const { syncSourceId, userId, message } = jobData;

  log.debug({ uid: message.uid, syncSourceId }, 'Processing email');

  try {
    const client = getGraphQLClient();

    // Check if already successfully processed
    const processedCheck = await client.request(queries.IS_EMAIL_PROCESSED, {
      syncSourceId,
      messageUid: message.uid,
    });

    if (processedCheck.processedEmail) {
      log.debug({ uid: message.uid }, 'Email already processed, skipping');
      return { success: true };
    }

    // Get sync source
    const sourceData = await client.request(queries.GET_SYNC_SOURCE, {
      id: syncSourceId,
      userId,
    });

    const source = sourceData.workerSyncSource;
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
    const parser = parserService.getParser(emailData as any);

    if (!parser) {
      throw new Error(`No parser available for this email type`);
    }

    const parseResult = parser.parse(emailData as any);

    if (!parseResult) {
      throw new Error(`Parser failed for ${source.bank}:${source.accountType}`);
    }

    // Handle unhandled email types by adding to DLQ
    if (parseResult.type === 'payment' || parseResult.type === 'unknown') {
      log.warn({ uid: message.uid, type: parseResult.type }, 'Unhandled email type, adding to DLQ');
      await client.request(mutations.CREATE_DLQ_ENTRY, {
        input: {
          userId,
          syncSourceId,
          messageUid: message.uid,
          subject: message.subject,
          fromAddress: message.from,
          date: message.date,
          bodyText: message.bodyText,
          bodyHtml: message.bodyHtml,
          errorMessage: `Unhandled email type: ${parseResult.type}`,
          errorType: 'UNSUPPORTED_TYPE',
        },
      });
      log.info({ uid: message.uid, type: parseResult.type }, 'DLQ entry created for unhandled type');
      return { success: true };
    }

    // Mark email as processed ONLY on success (for handled types)
    const processedEmail = await client.request(mutations.MARK_EMAIL_PROCESSED, {
      input: {
        userId,
        syncSourceId,
        messageUid: message.uid,
      },
    });

    if (parseResult.type === 'transaction') {
      const transaction = parseResult.data;

      // Create transaction record using the sync source's linked account
      await client.request(mutations.CREATE_TRANSACTION, {
        input: {
          userId,
          accountId: source.accountId,
          syncSourceId: source.id,
          processedEmailId: processedEmail.markEmailProcessed.id,
          amount: transaction.amount,
          transactionDate: transaction.date,
          name: transaction.merchant || 'Unknown Merchant',
          merchantName: transaction.merchant || null,
        },
      });

      log.info({ merchant: transaction.merchant, amount: Math.abs(transaction.amount).toFixed(2) }, 'Created transaction');

      return { success: true, transactionCreated: true };
    } else if (parseResult.type === 'credit_update') {
      const creditUpdate = parseResult.data;

      // Create balance update record using the sync source's linked account
      await client.request(mutations.CREATE_BALANCE_UPDATE, {
        input: {
          userId,
          accountId: source.accountId,
          syncSourceId: source.id,
          processedEmailId: processedEmail.markEmailProcessed.id,
          balanceType: 'available_balance',
          newBalance: creditUpdate.availableCredit,
          updateSource: 'email',
          sourceDetail: source.name.toLowerCase(),
          updateDate: message.date,
        },
      });

      log.info({ availableCredit: creditUpdate.availableCredit.toFixed(2) }, 'Updated credit');

      return { success: true, creditUpdate: true };
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    log.error({ uid: message.uid, error: errorMessage }, 'Email processing failed');

    // Re-throw the error so the caller can decide whether to retry or add to DLQ
    throw error;
  }
}

/**
 * Add failed email to DLQ via GraphQL
 */
export async function addDLQEntry(
  jobData: EmailProcessJobData,
  errorMessage: string,
  errorStack?: string
): Promise<void> {
  const { syncSourceId, userId, message } = jobData;

  try {
    const client = getGraphQLClient();

    await client.request(mutations.CREATE_DLQ_ENTRY, {
      input: {
        userId,
        syncSourceId,
        messageUid: message.uid,
        subject: message.subject,
        fromAddress: message.from,
        date: message.date,
        bodyText: message.bodyText,
        bodyHtml: message.bodyHtml,
        errorMessage,
        errorType: 'PARSE_ERROR',
        errorStack,
      },
    });

    log.info({ uid: message.uid }, 'DLQ entry created');
  } catch (error) {
    log.error({ err: error }, 'Failed to create DLQ entry');
  }
}
