// Auth
export { checkStatus, login, register, logout } from './auth'

// Accounts
export {
  listAccounts,
  getAccount,
  deactivateAccount,
  addAccount,
  getProviders,
  getAvailableBankTypes,
  addSyncSource,
  updateSyncSource,
  deleteSyncSource,
  testSyncSourceConnection,
  syncSyncSource,
} from './accounts'

// Budgets
export { listBudgets, getBudget, updateBudget } from './budgets'
export type { BudgetBucket, UpdateBudgetBucketInput } from './budgets'

// Income
export {
  listMonthlyPeriods,
  getCurrentPeriod,
  getMonthlyPeriod,
  createMonthlyPeriod,
  updateMonthlyPeriod,
  closeMonthlyPeriod,
  deleteMonthlyPeriod,
} from './income'
export type { MonthlyPeriod, CreateMonthlyPeriodInput, UpdateMonthlyPeriodInput } from './income'

// Transactions
export { listTransactions, listTransactionsByAccount, getTransaction } from './transactions'
