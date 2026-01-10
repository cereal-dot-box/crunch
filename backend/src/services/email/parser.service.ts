import { EmailParser, ParseResult, EmailMessage } from '../../accounts/base-parser';
import { BmoTransactionParser } from '../../accounts/bmo/creditcard/transaction/parser';
import { BmoCreditParser } from '../../accounts/bmo/creditcard/balance/parser';
import { RbcChequingTransactionParser } from '../../accounts/rbc/chequing/transaction/parser';

/**
 * Hierarchical parser registry: bank -> accountType -> syncSourceType -> parser
 */
const PARSERS: Record<string, Record<string, Record<string, EmailParser>>> = {
  bmo: {
    creditcard: {
      transactions: new BmoTransactionParser(),
      balance: new BmoCreditParser(),
    },
  },
  rbc: {
    chequing: {
      transactions: new RbcChequingTransactionParser(),
    },
  },
};

export class EmailParserService {
  private allParsers: EmailParser[];

  constructor() {
    // Flatten the nested bank -> accountType -> syncSourceType -> parser map
    this.allParsers = Object.values(PARSERS)
      .flatMap((accountTypes) => Object.values(accountTypes))
      .flatMap((syncSourceTypes) => Object.values(syncSourceTypes));
  }

  /**
   * Get all parsers for a specific bank
   */
  getParsersForBank(bank: string): EmailParser[] {
    const bankParsers = PARSERS[bank.toLowerCase()];
    if (!bankParsers) return [];
    return Object.values(bankParsers).flatMap((syncTypes) => Object.values(syncTypes));
  }

  /**
   * Get parsers for a specific bank and account type
   */
  getParsersForBankAndType(bank: string, accountType: string): EmailParser[] {
    const bankParsers = PARSERS[bank.toLowerCase()]?.[accountType.toLowerCase()];
    if (!bankParsers) return [];
    return Object.values(bankParsers);
  }

  /**
   * Get the specific parser for a bank, account type, and sync source type
   * Direct O(1) lookup - no iteration needed
   */
  getParserFor(bank: string, accountType: string, syncSourceType: string): EmailParser | null {
    return PARSERS[bank.toLowerCase()]?.[accountType.toLowerCase()]?.[syncSourceType.toLowerCase()] ?? null;
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
   * Register a parser for a specific bank, account type, and sync source type
   */
  registerParser(parser: EmailParser): void {
    const bank = parser.bank.toLowerCase();
    const accountType = parser.type.toLowerCase();
    const syncSourceType = parser.syncSourceType.toLowerCase();

    if (!PARSERS[bank]) {
      PARSERS[bank] = {};
    }
    if (!PARSERS[bank][accountType]) {
      PARSERS[bank][accountType] = {};
    }
    PARSERS[bank][accountType][syncSourceType] = parser;
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
