import { TransactionParser } from '../../../transaction-parser';
import { ParsedTransaction, EmailMessage } from '../../../base-parser';

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
    console.log('[RBC Parser] fromMatch:', fromMatch, 'from_address:', email.from_address);
    if (!fromMatch) {
      return false;
    }

    // Check if body contains deposit or withdrawal pattern
    const body = this.extractEmailBody(email);
    console.log('[RBC Parser] Body preview (first 300 chars):', body.substring(0, 300));

    const depositMatch = this.DEPOSIT_PATTERN.test(body);
    const withdrawalMatch = this.WITHDRAWAL_PATTERN.test(body);
    console.log('[RBC Parser] depositMatch:', depositMatch, 'withdrawalMatch:', withdrawalMatch);

    return depositMatch || withdrawalMatch;
  }

  parse(email: EmailMessage): { type: 'transaction'; data: ParsedTransaction } | null {
    if (!this.canParse(email)) {
      console.log('[RBC Parser] canParse returned false');
      return null;
    }

    const body = this.extractEmailBody(email);
    console.log('[RBC Parser] Body preview:', body.substring(0, 500));

    const isDeposit = this.DEPOSIT_PATTERN.test(body);
    console.log('[RBC Parser] isDeposit:', isDeposit);

    const pattern = isDeposit ? this.DEPOSIT_PATTERN : this.WITHDRAWAL_PATTERN;

    const match = body.match(pattern);
    if (!match) {
      console.log('[RBC Parser] Pattern match failed for', isDeposit ? 'deposit' : 'withdrawal');
      return null;
    }

    const [, amountStr, accountLast4, dateStr] = match;
    console.log('[RBC Parser] Parsed - amount:', amountStr, 'accountLast4:', accountLast4, 'dateStr:', dateStr);

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
