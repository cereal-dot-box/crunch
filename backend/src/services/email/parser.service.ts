import { EmailParser, ParseResult, EmailMessage } from '../../accounts/base-parser';
import { BmoTransactionParser } from '../../accounts/bmo/creditcard/transaction/parser';
import { BmoCreditParser } from '../../accounts/bmo/creditcard/balance/parser';
import { RbcChequingTransactionParser } from '../../accounts/rbc/chequing/transaction/parser';

/**
 * Parser registry: bank -> accountType -> array of parsers
 * Each bank/accountType combination can have multiple parsers (transaction, balance, payment, etc.)
 * Parsers use content-based detection via canParse() to determine if they can handle an email
 */
const PARSERS: Record<string, Record<string, EmailParser[]>> = {
  bmo: {
    creditcard: [new BmoTransactionParser(), new BmoCreditParser()],
  },
  rbc: {
    chequing: [new RbcChequingTransactionParser()],
  },
};

export class EmailParserService {
  private allParsers: EmailParser[];

  constructor() {
    // Flatten the nested bank -> accountType -> parser[] map
    this.allParsers = Object.values(PARSERS)
      .flatMap((accountTypes) => Object.values(accountTypes))
      .flatMap((parsers) => parsers);
  }

  /**
   * Get all parsers for a specific bank
   */
  getParsersForBank(bank: string): EmailParser[] {
    const bankParsers = PARSERS[bank.toLowerCase()];
    if (!bankParsers) return [];
    return Object.values(bankParsers).flatMap((parsers) => parsers);
  }

  /**
   * Get parsers for a specific bank and account type
   */
  getParsersForBankAndType(bank: string, accountType: string): EmailParser[] {
    const bankParsers = PARSERS[bank.toLowerCase()]?.[accountType.toLowerCase()];
    if (!bankParsers) return [];
    return bankParsers;
  }

  /**
   * @deprecated Use getParsersForBankAndType() or getParser() instead
   * This method is kept for backward compatibility but should not be used
   */
  getParserFor(bank: string, accountType: string, syncSourceType: string): EmailParser | null {
    // Find a parser that matches the bank/accountType
    const parsers = this.getParsersForBankAndType(bank, accountType);
    if (parsers.length === 0) return null;

    // Return the first parser (for backward compatibility)
    // In the new architecture, use content-based detection via getParser() instead
    return parsers[0];
  }

  /**
   * Parse an email using the appropriate parser
   * Uses content-based routing to find the right parser
   */
  parse(email: EmailMessage): ParseResult | null {
    for (const parser of this.allParsers) {
      if (parser.canParse(email)) {
        return parser.parse(email);
      }
    }

    return null;
  }

  /**
   * Get the parser that can handle this email
   */
  getParser(email: EmailMessage): EmailParser | null {
    for (const parser of this.allParsers) {
      if (parser.canParse(email)) {
        return parser;
      }
    }

    return null;
  }

  /**
   * Get bank name from email (by checking which parser handles it)
   * This is useful for auto-detecting which bank an email is from
   */
  detectBank(email: EmailMessage): string | null {
    for (const parser of this.allParsers) {
      if (parser.canParse(email)) {
        return parser.bank;
      }
    }
    return null;
  }

  /**
   * Get bank and type from email (by checking which parser handles it)
   */
  detectBankAndType(email: EmailMessage): { bank: string; type: string } | null {
    for (const parser of this.allParsers) {
      if (parser.canParse(email)) {
        return { bank: parser.bank, type: parser.type };
      }
    }
    return null;
  }

  /**
   * Register a parser for a specific bank and account type
   * The parser will be added to the array of parsers for that bank/accountType combination
   */
  registerParser(parser: EmailParser): void {
    const bank = parser.bank.toLowerCase();
    const accountType = parser.type.toLowerCase();

    if (!PARSERS[bank]) {
      PARSERS[bank] = {};
    }
    if (!PARSERS[bank][accountType]) {
      PARSERS[bank][accountType] = [];
    }
    PARSERS[bank][accountType].push(parser);
    this.allParsers.push(parser);
  }

  /**
   * Get all available banks that have parsers
   */
  getAvailableBanks(): string[] {
    return Object.keys(PARSERS);
  }

  /**
   * Get available account types for a specific bank
   */
  getAvailableTypesForBank(bank: string): string[] {
    const bankParsers = PARSERS[bank.toLowerCase()];
    if (!bankParsers) return [];
    return Object.keys(bankParsers);
  }

  /**
   * Get all available bank/type combinations
   */
  getAvailableBankTypes(): Array<{ bank: string; types: string[] }> {
    return Object.entries(PARSERS).map(([bank, types]) => ({
      bank,
      types: Object.keys(types),
    }));
  }
}

// Singleton instance
let parserServiceInstance: EmailParserService | null = null;

export function getEmailParserService(): EmailParserService {
  if (!parserServiceInstance) {
    parserServiceInstance = new EmailParserService();
  }
  return parserServiceInstance;
}
