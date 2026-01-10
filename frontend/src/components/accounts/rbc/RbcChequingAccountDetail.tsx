import { Account, SyncSource } from '../../../types';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';

interface RbcChequingAccountDetailProps {
  account: Account;
  syncSources?: SyncSource[];
  onDelete?: () => void;
  deletePending?: boolean;
  onBack?: () => void;
  onAddSyncSource?: () => void;
  onEditSyncSource?: (syncSource: SyncSource) => void;
  onRefreshSyncSource?: (syncSource: SyncSource) => void;
  refreshingSyncSourceId?: number | null;
  transactions?: any[];
}

export function RbcChequingAccountDetail({ account, syncSources = [], onDelete, deletePending, onBack, onAddSyncSource, onEditSyncSource, onRefreshSyncSource, refreshingSyncSourceId, transactions }: RbcChequingAccountDetailProps) {
  // Group sync sources by type
  const balanceSyncSources = syncSources.filter(s => s.type === 'balance');
  const transactionSyncSources = syncSources.filter(s => s.type === 'transactions');

  // Calculate monthly summary (incoming, outgoing, saved)
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const currentMonthTransactions = transactions?.filter(tx => {
    const txDate = new Date(tx.date);
    return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
  }) || [];

  const incoming = currentMonthTransactions
    .filter(tx => tx.amount > 0)
    .reduce((sum, tx) => sum + tx.amount, 0);

  const outgoing = Math.abs(currentMonthTransactions
    .filter(tx => tx.amount < 0)
    .reduce((sum, tx) => sum + tx.amount, 0));

  const saved = incoming - outgoing;

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start gap-4">
          {onBack && (
            <button onClick={onBack} className="text-sm text-gray-600 hover:text-gray-900">
              ← Back
            </button>
          )}
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{account.name}</h1>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Account Details */}
        <Card>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Account Details</h3>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Account Type</dt>
              <dd className="text-sm font-medium text-gray-900">
                {account.bank ? account.bank.toUpperCase() : 'Manual'} • {account.type}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Account Number</dt>
              <dd className="text-sm font-medium text-gray-900">•••• {account.mask}</dd>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-3 items-center">
              <dt className="text-sm text-gray-500">Incoming</dt>
              {currentMonthTransactions.length > 0 ? (
                <dd className="text-lg font-semibold text-green-600">
                  ${incoming.toFixed(2)}
                </dd>
              ) : transactionSyncSources.length === 0 ? (
                <dd className="flex-1 flex justify-end">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg px-2 py-1.5 text-center hover:border-indigo-400 hover:bg-indigo-50/30 transition-colors cursor-pointer" onClick={onAddSyncSource}>
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="text-xs font-medium text-gray-600">Add Sync Source</span>
                    </div>
                  </div>
                </dd>
              ) : (
                <dd className="text-sm text-gray-400">No transactions yet</dd>
              )}
            </div>
            <div className="flex justify-between items-center">
              <dt className="text-sm text-gray-500">Outgoing</dt>
              {currentMonthTransactions.length > 0 ? (
                <dd className="text-lg font-semibold text-red-600">
                  ${outgoing.toFixed(2)}
                </dd>
              ) : transactionSyncSources.length === 0 ? (
                <dd className="flex-1 flex justify-end">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg px-2 py-1.5 text-center hover:border-indigo-400 hover:bg-indigo-50/30 transition-colors cursor-pointer" onClick={onAddSyncSource}>
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="text-xs font-medium text-gray-600">Add Sync Source</span>
                    </div>
                  </div>
                </dd>
              ) : (
                <dd className="text-sm text-gray-400">No transactions yet</dd>
              )}
            </div>
            <div className="flex justify-between items-center">
              <dt className="text-sm text-gray-500">Saved</dt>
              {currentMonthTransactions.length > 0 ? (
                <dd className="text-lg font-semibold text-blue-600">
                  ${saved.toFixed(2)}
                </dd>
              ) : transactionSyncSources.length === 0 ? (
                <dd className="flex-1 flex justify-end">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg px-2 py-1.5 text-center hover:border-indigo-400 hover:bg-indigo-50/30 transition-colors cursor-pointer" onClick={onAddSyncSource}>
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="text-xs font-medium text-gray-600">Add Sync Source</span>
                    </div>
                  </div>
                </dd>
              ) : (
                <dd className="text-sm text-gray-400">No transactions yet</dd>
              )}
            </div>
          </dl>
        </Card>

        {/* Recent Transactions */}
        {transactions && (
          <Card>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Transactions</h3>
            {transactions.length > 0 ? (
              <div className="space-y-3">
                {transactions.slice(0, 10).map((tx) => (
                  <div
                    key={tx.transaction_id}
                    className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{tx.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(tx.date).toLocaleDateString()}
                      </p>
                    </div>
                    <p className={`text-sm font-medium ${tx.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {tx.amount < 0 ? '-' : '+'}${Math.abs(tx.amount).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 px-4">
                <p className="text-gray-500 text-sm mb-4">
                  {transactionSyncSources.length === 0 ? 'No transactions found' : 'No transactions synced yet'}
                </p>
                {onAddSyncSource && transactionSyncSources.length === 0 && (
                  <div className="inline-block border-2 border-dashed border-gray-300 rounded-lg px-3 py-2 hover:border-indigo-400 hover:bg-indigo-50/30 transition-colors cursor-pointer" onClick={onAddSyncSource}>
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="text-xs font-medium text-gray-600">Add Sync Source</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        )}

        {/* Sync Sources */}
        <Card>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Sync Sources</h3>

          {syncSources.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-gray-500 mb-4">No sync sources configured</p>
              {onAddSyncSource && (
                <Button size="sm" variant="secondary" className="w-full" onClick={onAddSyncSource}>
                  + Add Sync Source
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {balanceSyncSources.map((syncSource) => (
                <div key={syncSource.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-3 flex-1">
                    {onRefreshSyncSource && (
                      <button
                        onClick={() => onRefreshSyncSource(syncSource)}
                        disabled={refreshingSyncSourceId === syncSource.id}
                        className="text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed p-1"
                        title="Sync now"
                      >
                        {refreshingSyncSourceId === syncSource.id ? (
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        )}
                      </button>
                    )}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900">{syncSource.name}</p>
                        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">Balance</span>
                      </div>
                      <p className="text-xs text-gray-500">{syncSource.email_address}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right space-y-1">
                      <p className="text-xs text-gray-500">
                        {syncSource.balance_count} balance{syncSource.balance_count !== 1 ? 's' : ''}
                      </p>
                      <p className="text-xs text-gray-400">
                        Last sync: {syncSource.last_synced_at ? new Date(syncSource.last_synced_at).toLocaleDateString() : 'Never'}
                      </p>
                    </div>
                    {onEditSyncSource && (
                      <button
                        onClick={() => onEditSyncSource(syncSource)}
                        className="text-gray-400 hover:text-gray-600 p-1"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    )}
                    <div className={`w-2 h-2 rounded-full ${syncSource.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`} />
                  </div>
                </div>
              ))}
              {transactionSyncSources.map((syncSource) => (
                <div key={syncSource.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-3 flex-1">
                    {onRefreshSyncSource && (
                      <button
                        onClick={() => onRefreshSyncSource(syncSource)}
                        disabled={refreshingSyncSourceId === syncSource.id}
                        className="text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed p-1"
                        title="Sync now"
                      >
                        {refreshingSyncSourceId === syncSource.id ? (
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        )}
                      </button>
                    )}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900">{syncSource.name}</p>
                        <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">Transactions</span>
                      </div>
                      <p className="text-xs text-gray-500">{syncSource.email_address}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right space-y-1">
                      <p className="text-xs text-gray-500">
                        {syncSource.transaction_count} transaction{syncSource.transaction_count !== 1 ? 's' : ''}
                      </p>
                      <p className="text-xs text-gray-400">
                        Last sync: {syncSource.last_synced_at ? new Date(syncSource.last_synced_at).toLocaleDateString() : 'Never'}
                      </p>
                    </div>
                    {onEditSyncSource && (
                      <button
                        onClick={() => onEditSyncSource(syncSource)}
                        className="text-gray-400 hover:text-gray-600 p-1"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    )}
                    <div className={`w-2 h-2 rounded-full ${syncSource.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`} />
                  </div>
                </div>
              ))}
              <div className="flex pt-2">
                {onAddSyncSource && (
                  <Button size="sm" variant="secondary" className="flex-1" onClick={onAddSyncSource}>
                    + Add Sync Source
                  </Button>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
        {onDelete && (
          <button
            onClick={onDelete}
            disabled={deletePending}
            className="ml-auto text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded disabled:opacity-50"
          >
            {deletePending ? 'Deleting...' : 'Delete Account'}
          </button>
        )}
      </div>
    </>
  );
}
