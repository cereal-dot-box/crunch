import { ImapClient, EmailMessage } from './imap-client';
import { decryptImapPassword } from '../../lib/encryption';
import type { SyncSourceTable } from '../../types/database';

/**
 * Shared interface for IMAP connection details
 * SyncSource satisfies this interface
 */
interface ImapConnectionConfig {
  name: string;
  email_address: string;
  imap_host: string;
  imap_port: number;
  imap_password_encrypted: string;
  imap_folder: string;
  last_processed_uid: string | null;
}

export class ImapService {
  private client: ImapClient | null = null;

  constructor(private config: ImapConnectionConfig & { id: number }) {}

  private getImapClient(): ImapClient {
    if (!this.client) {
      const password = decryptImapPassword(this.config.imap_password_encrypted);

      this.client = new ImapClient({
        user: this.config.email_address,
        password,
        host: this.config.imap_host,
        port: this.config.imap_port,
        tls: true,
        tlsOptions: {
          rejectUnauthorized: false,
          servername: this.config.imap_host,
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
    const folderInfo = await client.openFolder(this.config.imap_folder, true);

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
    await client.openFolder(this.config.imap_folder, true);

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
    await client.openFolder(this.config.imap_folder, true);

    // Fetch emails in date range
    const emails = await client.fetchEmailsByDateRange(startDate, endDate);

    return emails;
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.connect();
      const client = this.getImapClient();
      await client.openFolder(this.config.imap_folder, true);
      await this.disconnect();
      return true;
    } catch (error) {
      console.error('IMAP connection test failed:', error);
      await this.disconnect();
      return false;
    }
  }

  getSyncSourceInfo() {
    return {
      id: this.config.id,
      name: this.config.name,
      emailAddress: this.config.email_address,
      folder: this.config.imap_folder,
      lastProcessedUid: this.config.last_processed_uid,
    };
  }
}

export async function createImapService(config: ImapConnectionConfig & { id: number }): Promise<ImapService> {
  return new ImapService(config);
}
