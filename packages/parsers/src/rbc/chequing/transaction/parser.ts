import { TransactionParser } from '../../../transaction-parser.js';
import { ParsedTransaction, EmailMessage } from '../../../base-parser.js';
import { loggers } from '../../../logger.js';

const log = loggers.parser;

// TODO: fix this up

/**
 * Parser for RBC chequing account transaction alert emails
 *
 * Deposit Pattern:
 * "A deposit of $123.45 was made to your bank account ********1234 on January 01, 2026"
 *
 * Withdrawal Pattern:
 * "A withdrawal of $567.89 was debited from your bank account ********1234"
 */
export class RbcChequingTransactionParser extends TransactionParser {
  readonly bank = 'rbc';
  readonly type = 'chequing';

  private readonly FROM_ADDRESS = 'rbcroyalbankalerts@alerts.rbc.com';

  // Matches: "A deposit of $123.45 was made to your bank account ********1234 on January 01, 2026"
  // Note: Asterisks around labels are optional (some emails have *Transaction Date:*, some have Transaction Date:)
  private readonly DEPOSIT_PATTERN =
    /a deposit of \$([\d,]+\.\d{2})\s+was made to your bank account \*{8}(\d{4}).*?\*?Transaction Date:\*?\s*((?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4})/is;

  // Matches: "A withdrawal of $567.89 was debited from your bank account ********1234"
  // Note: Asterisks around labels are optional (some emails have *Transaction Date:*, some have Transaction Date:)
  private readonly WITHDRAWAL_PATTERN =
    /a withdrawal of \$([\d,]+\.\d{2})\s+was debited from your bank account \*{8}(\d{4}).*?\*?Transaction Date:\*?\s*((?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4})/is;

  canParse(email: EmailMessage): boolean {
    // Check if email is from RBC or contains RBC in forwarded headers
    const fromMatch = email.from_address.toLowerCase().includes(this.FROM_ADDRESS) ||
                      email.body_text.toLowerCase().includes(this.FROM_ADDRESS);
    log.debug({ fromMatch, from_address: email.from_address }, 'RBC Parser: checking from address');
    if (!fromMatch) {
      return false;
    }

    // Check if body contains deposit or withdrawal pattern
    const body = this.extractEmailBody(email);
    log.trace({ bodyPreview: body.substring(0, 300) }, 'RBC Parser: body preview');

    const depositMatch = this.DEPOSIT_PATTERN.test(body);
    const withdrawalMatch = this.WITHDRAWAL_PATTERN.test(body);
    log.debug({ depositMatch, withdrawalMatch }, 'RBC Parser: pattern matching');

    return depositMatch || withdrawalMatch;
  }

  parse(email: EmailMessage): { type: 'transaction'; data: ParsedTransaction } | null {
    if (!this.canParse(email)) {
      log.debug('RBC Parser: canParse returned false');
      return null;
    }

    const body = this.extractEmailBody(email);
    log.trace({ bodyPreview: body.substring(0, 500) }, 'RBC Parser: body preview for parsing');

    const isDeposit = this.DEPOSIT_PATTERN.test(body);
    log.debug({ isDeposit }, 'RBC Parser: transaction type');

    const pattern = isDeposit ? this.DEPOSIT_PATTERN : this.WITHDRAWAL_PATTERN;

    const match = body.match(pattern);
    if (!match) {
      log.warn({ type: isDeposit ? 'deposit' : 'withdrawal' }, 'RBC Parser: pattern match failed');
      return null;
    }

    const [, amountStr, accountLast4, dateStr] = match;
    log.debug({ amount: amountStr, accountLast4, dateStr }, 'RBC Parser: parsed values');

    // Parse amount
    const rawAmount = this.parseAmount(amountStr);

    // Deposits are positive, withdrawals are negative
    const amount = isDeposit ? Math.abs(rawAmount) : -Math.abs(rawAmount);

    // Parse transaction date from capture group
    const date = new Date(dateStr).toISOString();

    // Merchant description
    const merchant = isDeposit ? 'RBC Deposit' : 'RBC Withdrawal';

    const transaction: ParsedTransaction = {
      date,
      amount,
      merchant,
      cardLast4: accountLast4,
      pending: false,
    };

    return {
      type: 'transaction',
      data: transaction,
    };
  }
}
