/**
 * Job data types for BullMQ queues
 */

/**
 * Email Process Job - Parse email content and create transactions
 * Contains the full email data needed for processing
 */
export interface EmailProcessJobData {
  syncSourceId: number;
  userId: number;
  message: {
    uid: string;
    subject: string;
    from: string;
    date: string;
    bodyText: string;
    bodyHtml?: string;
  };
}

/**
 * Email Fetch Job - Fetch emails from IMAP
 * Triggers the sync process for a sync source
 */
export interface EmailFetchJobData {
  syncSourceId: number;
  userId: number;
}

/**
 * DLQ Retry Job - Retry processing failed emails
 */
export interface DLQRetryJobData {
  userId: number;
  dlqId: number;
}

/**
 * Union type for all job data
 */
export type JobData = EmailProcessJobData | EmailFetchJobData | DLQRetryJobData;

/**
 * Job result types
 */
export interface EmailProcessResult {
  success: boolean;
  transactionCreated?: boolean;
  creditUpdate?: boolean;
  error?: string;
}

export interface EmailFetchResult {
  emailsFetched: number;
  jobsEnqueued: number;
  errors: string[];
}

export interface DLQRetryResult {
  success: boolean;
  exhausted?: boolean;
  error?: string;
}

/**
 * Queue names
 */
export const QUEUE_NAMES = {
  EMAIL_PROCESS: 'email-process',
  EMAIL_FETCH: 'email-fetch',
  DLQ_RETRY: 'dlq-retry',
} as const;
