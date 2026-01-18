/**
 * Job data types for BullMQ queues
 */

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

export const QUEUE_NAMES = {
  EMAIL_PROCESS: 'email-process',
} as const;
