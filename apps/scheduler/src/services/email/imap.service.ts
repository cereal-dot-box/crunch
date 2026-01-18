import { ImapClient, EmailMessage } from '../../lib/imap-client';
import { decryptImapPassword } from '../../lib/encryption';
import { loggers } from '../../lib/logger';
import type { SyncSourceConfig } from '../../config/rest-client';

const log = loggers.imap;

export class ImapService {
  private client: ImapClient | null = null;

  constructor(private config: SyncSourceConfig) {}

  private getImapClient(): ImapClient {
    if (!this.client) {
      const password = decryptImapPassword(this.config.imapPasswordEncrypted);

      this.client = new ImapClient({
        user: this.config.emailAddress,
        password,
        host: this.config.imapHost,
        port: this.config.imapPort,
        tls: true,
        tlsOptions: {
          rejectUnauthorized: false,
          servername: this.config.imapHost,
        },
        authTimeout: 10000,
        connTimeout: 10000,
      });
    }

    return this.client;
  }

  async connect(): Promise<void> {
    const client = this.getImapClient();
    await client.connect();
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.disconnect();
      this.client = null;
    }
  }

  async fetchNewEmails(limit?: number): Promise<EmailMessage[]> {
    const client = this.getImapClient();

    // Ensure we're connected
    if (!client.getConnectionStatus()) {
      await this.connect();
    }

    // Open the configured folder
    const folderInfo = await client.openFolder(this.config.imapFolder, true);

    if (folderInfo.totalMessages === 0) {
      return [];
    }

    // Fetch all emails from the folder
    const emails = await client.fetchAllEmails(limit);

    return emails;
  }

  async fetchEmailsByUidRange(startUid: number, endUid: number): Promise<EmailMessage[]> {
    const client = this.getImapClient();

    // Ensure we're connected
    if (!client.getConnectionStatus()) {
      await this.connect();
    }

    // Open the configured folder
    await client.openFolder(this.config.imapFolder, true);

    // Fetch emails in the UID range
    const emails = await client.fetchEmailsByUidRange(startUid, endUid);

    return emails;
  }

  async fetchEmailsByDateRange(startDate: Date, endDate: Date): Promise<EmailMessage[]> {
    const client = this.getImapClient();

    // Ensure we're connected
    if (!client.getConnectionStatus()) {
      await this.connect();
    }

    // Open the configured folder
    await client.openFolder(this.config.imapFolder, true);

    // Fetch emails in date range
    const emails = await client.fetchEmailsByDateRange(startDate, endDate);

    return emails;
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.connect();
      const client = this.getImapClient();
      await client.openFolder(this.config.imapFolder, true);
      await this.disconnect();
      return true;
    } catch (error) {
      log.error({ err: error }, 'IMAP connection test failed');
      await this.disconnect();
      return false;
    }
  }

  getSyncSourceInfo() {
    return {
      id: this.config.id,
      name: this.config.name,
      emailAddress: this.config.emailAddress,
      folder: this.config.imapFolder,
      lastProcessedUid: this.config.lastProcessedUid,
    };
  }
}

export async function createImapService(config: SyncSourceConfig): Promise<ImapService> {
  return new ImapService(config);
}
