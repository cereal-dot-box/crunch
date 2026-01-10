import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { getAccount, getProviders, listTransactionsByAccount } from '../../../server'
import { Button, CreditCardAccountDetail, DefaultAccountDetail, RbcChequingAccountDetail } from '../../../components/ui'
import { AddProviderModal } from '../../../components/accounts/AddProviderModal'
import { EditProviderModal } from '../../../components/accounts/EditProviderModal'
import type { SyncSource } from '../../../types'
import { useState } from 'react'

export const Route = createFileRoute('/_protected/account/$accountId')({
  loader: async ({ params }) => {
    const accountId = parseInt(params.accountId)
    const [accountData, transactionsData, syncSourcesData] = await Promise.all([
      getAccount({ data: { id: accountId } }),
      listTransactionsByAccount({ data: { accountId, limit: 100, offset: 0 } }),
      getProviders({ data: { accountId } }),
    ])
    return {
      account: accountData.account,
      transactions: transactionsData.transactions,
      syncSources: syncSourcesData.providers,
    }
  },
  component: AccountDetailPage,
  ssr: true,
})

function AccountDetailPage() {
  const { account, transactions, syncSources } = Route.useLoaderData()
  const navigate = useNavigate()
  const [showAddSyncSourceModal, setShowAddSyncSourceModal] = useState(false)
  const [editingSyncSource, setEditingSyncSource] = useState<SyncSource | null>(null)

  if (!account) {
    return (
      <div className="max-w-4xl mx-auto py-6 px-4">
        <div className="text-red-600">Account not found</div>
        <Button onClick={() => navigate({ to: '/accounts' })} className="mt-4">
          Back to Accounts
        </Button>
      </div>
    )
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this account? All associated transactions will also be deleted. This action cannot be undone.')) {
      // TODO: Implement delete using server function
      alert('Delete functionality to be implemented')
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        {account.bank === 'bmo' && account.type === 'creditcard' ? (
          <CreditCardAccountDetail
            account={account}
            onDelete={handleDelete}
            deletePending={false}
            onBack={() => navigate({ to: '/accounts' })}
            onAddSyncSource={() => setShowAddSyncSourceModal(true)}
            onEditSyncSource={(syncSource) => setEditingSyncSource(syncSource)}
            onRefreshSyncSource={(syncSource) => {
              alert('Refresh functionality to be implemented')
            }}
            refreshingSyncSourceId={null}
            transactions={transactions}
            syncSources={syncSources}
          />
        ) : account.bank === 'rbc' && account.type === 'chequing' ? (
          <RbcChequingAccountDetail
            account={account}
            onDelete={handleDelete}
            deletePending={false}
            onBack={() => navigate({ to: '/accounts' })}
            onAddSyncSource={() => setShowAddSyncSourceModal(true)}
            onEditSyncSource={(syncSource) => setEditingSyncSource(syncSource)}
            onRefreshSyncSource={(syncSource) => {
              alert('Refresh functionality to be implemented')
            }}
            refreshingSyncSourceId={null}
            transactions={transactions}
            syncSources={syncSources}
          />
        ) : (
          <DefaultAccountDetail
            account={account}
            onDelete={handleDelete}
            deletePending={false}
            onBack={() => navigate({ to: '/accounts' })}
            onAddSyncSource={() => setShowAddSyncSourceModal(true)}
            onEditSyncSource={(syncSource) => setEditingSyncSource(syncSource)}
            onRefreshSyncSource={(syncSource) => {
              alert('Refresh functionality to be implemented')
            }}
            transactions={transactions}
            syncSources={syncSources}
          />
        )}
      </div>

      {showAddSyncSourceModal && (
        <AddProviderModal
          accountId={account.id}
          onClose={() => setShowAddSyncSourceModal(false)}
          onSuccess={() => {
            setShowAddSyncSourceModal(false)
            window.location.reload()
          }}
        />
      )}

      {editingSyncSource && (
        <EditProviderModal
          provider={editingSyncSource}
          onClose={() => setEditingSyncSource(null)}
          onSuccess={() => {
            setEditingSyncSource(null)
            window.location.reload()
          }}
        />
      )}
    </div>
  )
}
