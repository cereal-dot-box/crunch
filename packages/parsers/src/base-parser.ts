export type AlertType = 'TRANSACTION' | 'CREDIT_LIMIT' | 'PAYMENT' | 'UNKNOWN';

/**
 * Email message data passed to parsers
 * This is the structure of email data received from IMAP and queued for processing
 */
export interface EmailMessage {
  message_uid: string;
  subject: string;
  from_address: string;
  date: string;
  body_text: string;
  body_html: string | null;
  alert_type: AlertType;
  user_id: number;
  sync_source_id: number;
  created_at: string;
}

export interface ParsedTransaction {
  date: string; // ISO date string
  amount: number; // Positive for credits, negative for debits
  merchant: string;
  cardLast4: string;
  pending: boolean;
}

export interface ParsedCreditUpdate {
  availableCredit: number;
  cardLast4: string;
}

export interface ParsedPayment {
  amount: number;
  date: string;
  cardLast4: string;
}

export type ParseResult =
  | { type: 'transaction'; data: ParsedTransaction }
  | { type: 'credit_update'; data: ParsedCreditUpdate }
  | { type: 'payment'; data: ParsedPayment }
  | { type: 'unknown'; data: null };

export interface EmailParser {
  /**
   * The bank this parser handles (e.g., 'bmo', 'td', 'rbc')
   */
  readonly bank: string;

  /**
   * The account type this parser handles (e.g., 'creditcard', 'checking')
   */
  readonly type: string;

  /**
   * The sync source type this parser handles (e.g., 'transactions', 'balance')
   */
  readonly syncSourceType: string;

  /**
   * Determine if this parser can handle the given email
   */
  canParse(email: EmailMessage): boolean;

  /**
   * Parse the email and extract relevant data
   */
  parse(email: EmailMessage): ParseResult | null;
}

export abstract class BaseEmailParser implements EmailParser {
  abstract readonly bank: string;
  abstract readonly type: string;
  abstract readonly syncSourceType: string;

  abstract canParse(email: EmailMessage): boolean;
  abstract parse(email: EmailMessage): ParseResult | null;

  /**
   * Helper to extract text body, handling forwarded emails
   */
  protected extractEmailBody(email: EmailMessage): string {
    let body = email.body_text;

    // Remove inline image references that break pattern matching
    // Pattern: [https://www1.bmo.com/onlinebanking/images/alert/...gif]
    body = body.replace(/\[https?:\/\/[^\]]+\.(?:gif|png|jpg)\]/gi, '');

    // Normalize newlines to spaces for regex pattern matching
    // BMO emails often have newlines that break patterns like "...$11.12 at\nSTRIPE-Z.AI was approved..."
    body = body.replace(/\s+/g, ' ');

    // Check if email is forwarded
    if (body.includes('---------- Forwarded message ---------')) {
      // Extract original email content after forward header
      const lines = body.split('\n');

      // Find where the actual content starts (after the forwarding headers)
      const contentStartIndex = lines.findIndex((line, index) => {
        // Look for empty line after "To:" header
        return index > 0 &&
               lines[index - 1].startsWith('To:') &&
               line.trim() === '';
      });

      if (contentStartIndex !== -1) {
        return lines.slice(contentStartIndex + 1).join('\n');
      }
    }

    return body;
  }

  /**
   * Helper to parse amount from string like "$34.11" or "$2,120.13"
   */
  protected parseAmount(amountStr: string): number {
    // Remove $ and commas, then parse
    const cleaned = amountStr.replace(/[$,]/g, '');
    return parseFloat(cleaned);
  }
}
