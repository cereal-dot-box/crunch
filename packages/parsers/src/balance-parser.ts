import { BaseEmailParser, EmailMessage, ParsedCreditUpdate } from './base-parser.js';

/**
 * Base class for balance parsers
 * Handles parsing of balance/credit update alert emails
 */
export abstract class BalanceParser extends BaseEmailParser {
  readonly syncSourceType = 'balance';

  abstract parse(email: EmailMessage): { type: 'credit_update'; data: ParsedCreditUpdate } | null;
}
