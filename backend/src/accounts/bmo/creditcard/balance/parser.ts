import { BalanceParser } from '../../../balance-parser';
import { ParsedCreditUpdate, EmailMessage } from '../../../base-parser';

/**
 * Parser for BMO credit limit alert emails
 *
 * Pattern:
 * "You have $1,234.56 of available credit left on your BMO credit card ending in 5678"
 */
export class BmoCreditParser extends BalanceParser {
  readonly bank = 'bmo';
  readonly type = 'creditcard';

  private readonly FROM_ADDRESS = 'bmoalerts@bmo.com';
  private readonly CREDIT_LIMIT_PATTERN =
    /You have \*?\$([\d,]+\.\d{2})\*? of available credit left on your BMO credit card\s+ending in \*?(\d{4})\*?/is;

  canParse(email: EmailMessage): boolean {
    // Check if email is from BMO or contains BMO in forwarded headers
    const fromMatch = email.from_address.toLowerCase().includes(this.FROM_ADDRESS) ||
                      email.body_text.toLowerCase().includes(this.FROM_ADDRESS);
    if (!fromMatch) {
      return false;
    }

    // Check if body contains credit limit pattern
    const body = this.extractEmailBody(email);
    return this.CREDIT_LIMIT_PATTERN.test(body);
  }

  parse(email: EmailMessage): { type: 'credit_update'; data: ParsedCreditUpdate } | null {
    if (!this.canParse(email)) {
      return null;
    }

    const body = this.extractEmailBody(email);
    const match = body.match(this.CREDIT_LIMIT_PATTERN);

    if (!match) {
      return null;
    }

    const [, amountStr, cardLast4] = match;

    // Parse available credit amount
    const availableCredit = this.parseAmount(amountStr);

    const creditUpdate: ParsedCreditUpdate = {
      availableCredit,
      cardLast4,
    };

    return {
      type: 'credit_update',
      data: creditUpdate,
    };
  }
}
