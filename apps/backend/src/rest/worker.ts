import { FastifyInstance } from 'fastify';
import { verifyServiceToken, extractToken } from '../lib/jwks';
import { loggers } from '../lib/logger';
import { ProcessedEmail } from '../models/processed-emails';
import { SyncSource } from '../models/sync-source';
import { Transaction } from '../models/transaction';
import { BalanceUpdate } from '../models/balance-update';
import { EmailAlertDLQ } from '../models/email-alert-dlq';

const log = loggers.http;

// Authentication middleware for worker routes
async function authenticate(request: any, reply: any) {
  const token = extractToken(request.headers.authorization);

  if (!token) {
    return reply.code(401).send({ error: 'Unauthorized' });
  }

  try {
    await verifyServiceToken(token);
  } catch {
    return reply.code(401).send({ error: 'Unauthorized' });
  }
}

export async function workerRoutes(app: FastifyInstance) {
  // Add authentication hook for all worker routes
  app.addHook('onRequest', authenticate);

  // GET /api/worker/processed-emails - check if email was already processed
  app.get<{ Querystring: { syncSourceId: string; messageUid: string } }>('/processed-emails', async (request, reply) => {
    try {
      const { syncSourceId, messageUid } = request.query;

      if (!syncSourceId || !messageUid) {
        return reply.code(400).send({ error: 'syncSourceId and messageUid are required' });
      }

      const isProcessed = await ProcessedEmail.isProcessed(parseInt(syncSourceId, 10), messageUid);

      return reply.send({ processed: isProcessed });
    } catch (error) {
      log.error({ err: error }, 'Error checking processed email');
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // GET /api/worker/sync-sources/:id - get sync source by ID
  app.get<{ Params: { id: string }; Querystring: { userId: string } }>('/sync-sources/:id', async (request, reply) => {
    try {
      const { userId } = request.query;
      const id = parseInt(request.params.id, 10);

      if (!userId) {
        return reply.code(400).send({ error: 'userId query parameter is required' });
      }

      const source = await SyncSource.getById(id, userId);
      if (!source) {
        return reply.code(404).send({ error: 'Sync source not found' });
      }

      const sourceData = source.toJSON();
      return reply.send({
        id: sourceData.id,
        name: sourceData.name,
        bank: sourceData.bank,
        accountType: sourceData.account_type,
        accountId: sourceData.account_id,
      });
    } catch (error) {
      log.error({ err: error }, 'Error fetching sync source');
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // POST /api/worker/processed-emails - mark email as processed
  app.post<{ Body: { userId: string; syncSourceId: number; messageUid: string } }>('/processed-emails', async (request, reply) => {
    try {
      const { userId, syncSourceId, messageUid } = request.body;

      if (!userId || !syncSourceId || !messageUid) {
        return reply.code(400).send({ error: 'userId, syncSourceId, and messageUid are required' });
      }

      const processedEmail = await ProcessedEmail.mark({ userId, syncSourceId, messageUid });

      return reply.send({
        id: processedEmail.id,
        messageUid: processedEmail.messageUid,
      });
    } catch (error) {
      log.error({ err: error }, 'Error marking email as processed');
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // POST /api/worker/transactions - create transaction from parsed email
  app.post<{ Body: {
    userId: string;
    accountId: number;
    syncSourceId: number;
    processedEmailId: number;
    amount: number;
    transactionDate: string;
    name: string;
    merchantName?: string;
  } }>('/transactions', async (request, reply) => {
    try {
      const { userId, accountId, syncSourceId, processedEmailId, amount, transactionDate, name, merchantName } = request.body;

      if (!userId || !accountId || !syncSourceId || !processedEmailId || amount == null || !transactionDate || !name) {
        return reply.code(400).send({ error: 'Missing required fields' });
      }

      const transaction = await Transaction.create({
        userId,
        accountId,
        syncSourceId,
        processedEmailId,
        amount,
        transactionDate,
        name,
        merchantName,
      });

      return reply.send({
        id: transaction.id,
        amount: transaction.amount,
        name: transaction.name,
      });
    } catch (error) {
      log.error({ err: error }, 'Error creating transaction');
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // POST /api/worker/balance-updates - create balance update from parsed email
  app.post<{ Body: {
    userId: string;
    accountId: number;
    syncSourceId: number;
    processedEmailId: number;
    balanceType: 'available_balance' | 'current_balance';
    newBalance: number;
    updateSource: string;
    sourceDetail: string;
    updateDate: string;
  } }>('/balance-updates', async (request, reply) => {
    try {
      const { userId, accountId, syncSourceId, processedEmailId, balanceType, newBalance, updateSource, sourceDetail, updateDate } = request.body;

      if (!userId || !accountId || !syncSourceId || !processedEmailId || !balanceType || newBalance == null || !updateSource || !sourceDetail || !updateDate) {
        return reply.code(400).send({ error: 'Missing required fields' });
      }

      await BalanceUpdate.create({
        userId,
        accountId,
        syncSourceId,
        processedEmailId,
        balanceType,
        newBalance,
        updateSource,
        sourceDetail,
        updateDate,
      });

      return reply.send({ success: true });
    } catch (error) {
      log.error({ err: error }, 'Error creating balance update');
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // POST /api/worker/dlq - create DLQ entry for failed email
  app.post<{ Body: {
    userId: string;
    syncSourceId: number;
    messageUid: string;
    subject: string;
    fromAddress: string;
    date: string;
    bodyText: string;
    bodyHtml?: string;
    errorMessage: string;
    errorType: string;
    errorStack?: string;
  } }>('/dlq', async (request, reply) => {
    try {
      const { userId, syncSourceId, messageUid, subject, fromAddress, date, bodyText, bodyHtml, errorMessage, errorType, errorStack } = request.body;

      if (!userId || !syncSourceId || !messageUid || !subject || !fromAddress || !date || !bodyText || !errorMessage || !errorType) {
        return reply.code(400).send({ error: 'Missing required fields' });
      }

      await EmailAlertDLQ.create({
        userId,
        syncSourceId,
        messageUid,
        subject,
        fromAddress,
        date,
        bodyText,
        bodyHtml,
        errorMessage,
        errorType: errorType as any,
        errorStack,
      });

      return reply.send({ success: true });
    } catch (error) {
      log.error({ err: error }, 'Error creating DLQ entry');
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
}
