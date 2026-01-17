export interface ProcessedEmailsRow {
  id: number;
  user_id: number;
  sync_source_id: number;
  message_uid: string;
  content_hash: string | null;
  processed_at: string;
}

export interface MarkEmailProcessedParams {
  userId: number;
  syncSourceId: number;
  messageUid: string;
  contentHash?: string;
}
