import Imap from 'imap';
import { simpleParser, ParsedMail } from 'mailparser';
import { loggers } from './logger';

const log = loggers.imap;

export interface ImapConfig {
  user: string;
  password: string;
  host: string;
  port: number;
  tls: boolean;
  tlsOptions?: {
    rejectUnauthorized?: boolean;
    servername?: string;
  };
  authTimeout?: number;
  connTimeout?: number;
}

export interface EmailMessage {
  uid: number;
  subject: string;
  from: string;
  date: Date;
  textBody: string;
  htmlBody?: string;
}

export class ImapClient {
  private imap: Imap;
  private config: ImapConfig;
  private isConnected: boolean = false;

  constructor(config: ImapConfig) {
    this.config = config;
    this.imap = new Imap(config);
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.imap.once('ready', () => {
      this.isConnected = true;
    });

    this.imap.once('end', () => {
      this.isConnected = false;
    });

    this.imap.on('error', (err: Error) => {
      log.error({ err }, 'IMAP error');
      this.isConnected = false;
    });
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, this.config.connTimeout || 10000);

      this.imap.once('ready', () => {
        clearTimeout(timeout);
        this.isConnected = true;
        resolve();
      });

      this.imap.once('error', (err: Error) => {
        clearTimeout(timeout);
        reject(err);
      });

      this.imap.connect();
    });
  }

  async disconnect(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.isConnected) {
        resolve();
        return;
      }

      this.imap.once('end', () => {
        this.isConnected = false;
        resolve();
      });

      this.imap.end();
    });
  }

  async openFolder(folderName: string, readOnly: boolean = true): Promise<{ totalMessages: number }> {
    return new Promise((resolve, reject) => {
      this.imap.openBox(folderName, readOnly, (err, box) => {
        if (err) {
          reject(err);
          return;
        }

        resolve({
          totalMessages: box.messages.total,
        });
      });
    });
  }

  async fetchAllEmails(limit?: number): Promise<EmailMessage[]> {
    return new Promise((resolve, reject) => {
      this.imap.search(['ALL'], (err, uids) => {
        if (err) {
          reject(err);
          return;
        }

        if (uids.length === 0) {
          resolve([]);
          return;
        }

        // Apply limit if specified - take most recent emails (highest UIDs)
        const limitedUids = limit ? uids.slice(-limit) : uids;

        const emails: EmailMessage[] = [];
        let messagesProcessed = 0;
        let messagesToProcess = limitedUids.length;

        const fetch = this.imap.fetch(limitedUids, {
          bodies: '',
          struct: true,
        });

        fetch.on('message', (msg, seqno) => {
          let uid = 0;
          let buffer = '';

          msg.on('body', (stream) => {
            stream.on('data', (chunk) => {
              buffer += chunk.toString('utf8');
            });
          });

          msg.once('attributes', (attrs) => {
            uid = attrs.uid;
          });

          msg.once('end', async () => {
            try {
              const parsed: ParsedMail = await simpleParser(buffer);

              emails.push({
                uid,
                subject: parsed.subject || '(no subject)',
                from: parsed.from?.text || '(unknown)',
                date: parsed.date || new Date(),
                textBody: parsed.text || '',
                htmlBody: parsed.html || undefined,
              });
            } catch (parseError) {
              log.error({ err: parseError, seqno }, 'Error parsing message');
            } finally {
              messagesProcessed++;
              if (messagesProcessed === messagesToProcess) {
                resolve(emails);
              }
            }
          });
        });

        fetch.once('error', (err) => {
          log.error({ err }, 'Fetch error');
          reject(err);
        });
      });
    });
  }

  async fetchEmailsByUidRange(startUid: number, endUid: number): Promise<EmailMessage[]> {
    return new Promise((resolve, reject) => {
      const emails: EmailMessage[] = [];
      const range = `${startUid}:${endUid}`;
      const pendingMessages = new Set<number>();

      const fetch = this.imap.fetch(range, {
        bodies: '',
        struct: true,
      });

      fetch.on('message', (msg, seqno) => {
        pendingMessages.add(seqno);
        let uid = 0;
        let buffer = '';

        msg.on('body', (stream) => {
          stream.on('data', (chunk) => {
            buffer += chunk.toString('utf8');
          });
        });

        msg.once('attributes', (attrs) => {
          uid = attrs.uid;
        });

        msg.once('end', async () => {
          try {
            const parsed: ParsedMail = await simpleParser(buffer);

            emails.push({
              uid,
              subject: parsed.subject || '(no subject)',
              from: parsed.from?.text || '(unknown)',
              date: parsed.date || new Date(),
              textBody: parsed.text || '',
              htmlBody: parsed.html || undefined,
            });
          } catch (parseError) {
            log.error({ err: parseError, seqno }, 'Error parsing message');
          } finally {
            pendingMessages.delete(seqno);
          }
        });
      });

      fetch.once('error', (err) => {
        reject(err);
      });

      fetch.once('end', () => {
        // Wait for all pending message parsing to complete
        const checkDone = () => {
          if (pendingMessages.size === 0) {
            resolve(emails);
          } else {
            setTimeout(checkDone, 10);
          }
        };
        checkDone();
      });
    });
  }

  async fetchEmailsSinceUid(lastUid: string | null, limit?: number): Promise<EmailMessage[]> {
    return new Promise((resolve, reject) => {
      // Search for ALL messages, then filter by UID
      // IMAP library doesn't support UID range in search, so we filter ourselves
      const searchCriteria = ['ALL'];

      this.imap.search(searchCriteria, (err, uids) => {
        if (err) {
          reject(err);
          return;
        }

        log.debug({ count: uids.length }, 'Found total emails in folder');

        // Filter UIDs to only include those after lastUid
        const filteredUids = lastUid
          ? uids.filter((uid) => uid > parseInt(lastUid))
          : uids;

        log.debug({ lastUid: lastUid || '0', count: filteredUids.length }, 'After filtering: emails to fetch');

        if (filteredUids.length === 0) {
          resolve([]);
          return;
        }

        // Apply limit if specified
        const limitedUids = limit ? filteredUids.slice(0, limit) : filteredUids;

        const emails: EmailMessage[] = [];
        let messagesProcessed = 0;
        let messagesToProcess = limitedUids.length;

        log.debug({ uids: limitedUids }, 'Fetching UIDs');

        const fetch = this.imap.fetch(limitedUids, {
          bodies: '',
          struct: true,
        });

        fetch.on('message', (msg, seqno) => {
          log.trace({ seqno }, 'Received message event');
          let uid = 0;
          let buffer = '';

          msg.on('body', (stream) => {
            stream.on('data', (chunk) => {
              buffer += chunk.toString('utf8');
            });
          });

          msg.once('attributes', (attrs) => {
            uid = attrs.uid;
          });

          msg.once('end', async () => {
            try {
              const parsed: ParsedMail = await simpleParser(buffer);

              emails.push({
                uid,
                subject: parsed.subject || '(no subject)',
                from: parsed.from?.text || '(unknown)',
                date: parsed.date || new Date(),
                textBody: parsed.text || '',
                htmlBody: parsed.html || undefined,
              });
              log.trace({ uid, total: emails.length }, 'Parsed email');
            } catch (parseError) {
              log.error({ err: parseError, seqno }, 'Error parsing message');
            } finally {
              messagesProcessed++;
              if (messagesProcessed === messagesToProcess) {
                log.debug({ count: emails.length }, 'All messages processed');
                resolve(emails);
              }
            }
          });
        });

        fetch.once('error', (err) => {
          log.error({ err }, 'Fetch error');
          reject(err);
        });
      });
    });
  }

  async fetchEmailsByDateRange(startDate: Date, endDate: Date): Promise<EmailMessage[]> {
    return new Promise((resolve, reject) => {
      // IMAP SINCE search uses format: DD-Mon-YYYY
      const formatDate = (date: Date): string => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const day = date.getDate();
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
      };

      // Search for emails since the start date - use flat array for search criteria
      const searchCriteria = ['SINCE', formatDate(startDate)];

      this.imap.search(searchCriteria, (err, uids) => {
        if (err) {
          reject(err);
          return;
        }

        if (uids.length === 0) {
          resolve([]);
          return;
        }

        const emails: EmailMessage[] = [];
        const pendingMessages = new Set<number>();

        const fetch = this.imap.fetch(uids, {
          bodies: '',
          struct: true,
        });

        fetch.on('message', (msg, seqno) => {
          pendingMessages.add(seqno);
          let uid = 0;
          let buffer = '';

          msg.on('body', (stream) => {
            stream.on('data', (chunk) => {
              buffer += chunk.toString('utf8');
            });
          });

          msg.once('attributes', (attrs) => {
            uid = attrs.uid;
          });

          msg.once('end', async () => {
            try {
              const parsed: ParsedMail = await simpleParser(buffer);
              const emailDate = parsed.date || new Date();

              // Filter by end date (IMAP SINCE doesn't support BEFORE)
              if (emailDate <= endDate && emailDate >= startDate) {
                emails.push({
                  uid,
                  subject: parsed.subject || '(no subject)',
                  from: parsed.from?.text || '(unknown)',
                  date: emailDate,
                  textBody: parsed.text || '',
                  htmlBody: parsed.html || undefined,
                });
              }
            } catch (parseError) {
              log.error({ err: parseError, seqno }, 'Error parsing message');
            } finally {
              pendingMessages.delete(seqno);
            }
          });
        });

        fetch.once('error', (err) => {
          reject(err);
        });

        fetch.once('end', () => {
          // Wait for all pending message parsing to complete
          const checkDone = () => {
            if (pendingMessages.size === 0) {
              resolve(emails);
            } else {
              setTimeout(checkDone, 10);
            }
          };
          checkDone();
        });
      });
    });
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}
