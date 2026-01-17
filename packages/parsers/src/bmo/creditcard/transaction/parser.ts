import { TransactionParser } from '../../../transaction-parser.js';
import { ParsedTransaction, EmailMessage } from '../../../base-parser.js';

/**
 * Parser for BMO transaction alert emails
 *
 * Pattern:
 * "a transaction in the amount of $12.34 at EXAMPLE STORE was approved on your BMO® Credit Card ending in 5678"
 */
export class BmoTransactionParser extends TransactionParser {
  readonly bank = 'bmo';
  readonly type = 'creditcard';

  private readonly FROM_ADDRESS = 'bmoalerts@bmo.com';
  private readonly TRANSACTION_PATTERN =
    /a transaction in the amount of \$([\d,]+\.\d{2}) at (.+?)\s+was\s+(approved|declined).+?BMO®\s*Credit\s+Card\s+ending\s+in\s+(\d{4})/is;

  canParse(email: EmailMessage): boolean {
    // Check if email is from BMO or contains BMO in forwarded headers
    const fromMatch = email.from_address.toLowerCase().includes(this.FROM_ADDRESS) ||
                      email.body_text.toLowerCase().includes(this.FROM_ADDRESS);
    if (!fromMatch) {
      return false;
    }

    // Check if body contains transaction pattern
    const body = this.extractEmailBody(email);
    return this.TRANSACTION_PATTERN.test(body);
  }

  parse(email: EmailMessage): { type: 'transaction'; data: ParsedTransaction } | null {
    if (!this.canParse(email)) {
      return null;
    }

    const body = this.extractEmailBody(email);
    const match = body.match(this.TRANSACTION_PATTERN);

    if (!match) {
      return null;
    }

    const [, amountStr, merchant, status, cardLast4] = match;

    // Parse amount
    const amount = this.parseAmount(amountStr);

    // BMO credit cards: positive amounts are debits (money spent)
    // We store debits as negative, credits as positive
    const normalizedAmount = -Math.abs(amount);

    // Clean up merchant name (remove newlines and extra whitespace)
    const cleanMerchant = merchant.replace(/\s+/g, ' ').trim();

    // Use email date as transaction date
    // Note: This may be slightly off from actual transaction date
    const date = email.date;

    const transaction: ParsedTransaction = {
      date,
      amount: normalizedAmount,
      merchant: cleanMerchant,
      cardLast4,
      pending: false, // BMO only sends alerts for approved transactions
    };

    return {
      type: 'transaction',
      data: transaction,
    };
  }
}
