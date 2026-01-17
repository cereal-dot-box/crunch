import * as repo from './repository';
import type { MonthlyPeriodRow, CreateMonthlyPeriodParams, UpdateMonthlyPeriodParams } from './types';

export class MonthlyPeriod {
  static getByUserId: (userId: string) => Promise<MonthlyPeriod[]>;
  static getByMonth: (userId: string, month: string) => Promise<MonthlyPeriod | null>;
  static getById: (id: number, userId: string) => Promise<MonthlyPeriod | null>;
  static create: (params: CreateMonthlyPeriodParams) => Promise<MonthlyPeriodRow>;
  static update: (id: number, userId: string, params: UpdateMonthlyPeriodParams) => Promise<MonthlyPeriod | null>;
  static close: (id: number, userId: string) => Promise<MonthlyPeriod | null>;
  static delete: (id: number, userId: string) => Promise<void>;
  static getOpen: (userId: string) => Promise<MonthlyPeriod | null>;
  constructor(private data: MonthlyPeriodRow) {}

  get id() { return this.data.id; }
  get userId() { return this.data.user_id; }
  get month() { return this.data.month; }
  get projectedIncome() { return this.data.projected_income; }
  get actualIncome() { return this.data.actual_income; }
  get status() { return this.data.status; }
  get notes() { return this.data.notes; }
  get createdAt() { return this.data.created_at; }
  get updatedAt() { return this.data.updated_at; }

  get isOpen() { return this.data.status === 'open'; }
  get isClosed() { return this.data.status === 'closed'; }

  toJSON(): MonthlyPeriodRow {
    return {
      ...this.data,
      is_open: this.isOpen,
      is_closed: this.isClosed,
    };
  }
}

// Static factory methods
MonthlyPeriod.getByUserId = async (userId: string): Promise<MonthlyPeriod[]> => {
  const rows = await repo.getMonthlyPeriodsByUserId(userId);
  return rows.map(row => new MonthlyPeriod(row));
};

MonthlyPeriod.getByMonth = async (userId: string, month: string): Promise<MonthlyPeriod | null> => {
  const row = await repo.getMonthlyPeriod(userId, month);
  return row ? new MonthlyPeriod(row) : null;
};

MonthlyPeriod.getById = async (id: number, userId: string): Promise<MonthlyPeriod | null> => {
  const row = await repo.getMonthlyPeriodById(id, userId);
  return row ? new MonthlyPeriod(row) : null;
};

MonthlyPeriod.create = async (params: CreateMonthlyPeriodParams): Promise<MonthlyPeriodRow> => {
  const row = await repo.createMonthlyPeriod(params);
  return {
    ...row,
    is_open: row.status === 'open',
    is_closed: row.status === 'closed',
  };
};

MonthlyPeriod.update = async (
  id: number,
  userId: string,
  params: UpdateMonthlyPeriodParams
): Promise<MonthlyPeriod | null> => {
  const row = await repo.updateMonthlyPeriod(id, userId, params);
  return row ? new MonthlyPeriod(row) : null;
};

MonthlyPeriod.close = async (id: number, userId: string): Promise<MonthlyPeriod | null> => {
  const row = await repo.closeMonthlyPeriod(id, userId);
  return row ? new MonthlyPeriod(row) : null;
};

MonthlyPeriod.delete = async (id: number, userId: string): Promise<void> => {
  await repo.deleteMonthlyPeriod(id, userId);
};

MonthlyPeriod.getOpen = async (userId: string): Promise<MonthlyPeriod | null> => {
  const row = await repo.getOpenMonthlyPeriod(userId);
  return row ? new MonthlyPeriod(row) : null;
};

export type { MonthlyPeriodRow, CreateMonthlyPeriodParams, UpdateMonthlyPeriodParams };
