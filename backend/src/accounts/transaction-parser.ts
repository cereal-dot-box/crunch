import { BaseEmailParser, EmailMessage, ParseResult, ParsedTransaction } from './base-parser';

/**
 * Base class for transaction parsers
 * Handles parsing of transaction alert emails
 */
export abstract class TransactionParser extends BaseEmailParser {
  readonly syncSourceType = 'transactions';

  abstract parse(email: EmailMessage): { type: 'transaction'; data: ParsedTransaction } | null;
}
