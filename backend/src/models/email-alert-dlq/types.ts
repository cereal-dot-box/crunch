export type DLQErrorType = 'PARSE_ERROR' | 'NO_PARSER' | 'VALIDATION_ERROR' | 'NO_ACCOUNT' | 'UNSUPPORTED_TYPE';

export interface EmailAlertDLQRow {
  id: number;
  user_id: number;
  sync_source_id: number;
  message_uid: string | null;
  subject: string | null;
  from_address: string | null;
  date: string | null;
  body_text: string | null;
  body_html: string | null;
  error_message: string;
  error_type: DLQErrorType;
  error_stack: string | null;
  created_at: string;
}

export interface CreateDLQEntryParams {
  userId: number;
  syncSourceId: number;
  messageUid?: string | null;
  subject?: string | null;
  fromAddress?: string | null;
  date?: string | null;
  bodyText?: string | null;
  bodyHtml?: string | null;
  errorMessage: string;
  errorType: DLQErrorType;
  errorStack?: string | null;
  maxAttempts?: number;
}
