import { createFileRoute, Link } from '@tanstack/react-router'
import { listAccounts } from '../../server/accounts'
import { listTransactionsByAccount } from '../../server/transactions'
import { CreditCardAccountCard, DefaultAccountCard, RbcChequingAccountCard, Button } from '../../components/ui'
import { AddAccountModal } from '../../components/accounts/AddAccountModal'
import { useState } from 'react'

export const Route = createFileRoute('/_protected/accounts')({
  loader: async () => {
    const accountsData = await listAccounts()
    return { accounts: accountsData.accounts }
  },
  component: AccountsPage,
  ssr: true,
})

function AccountsPage() {
  const { accounts } = Route.useLoaderData()
  const [showAddModal, setShowAddModal] = useState(false)

  // For accounts needing transactions, we'd need to fetch them client-side
  // or include them in the loader. For now, passing empty arrays.
  const transactionsMap = new Map<number, any[]>()

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Accounts</h1>
        </div>

        {accounts.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6 mb-6">
            {accounts.map((account) => (
              <Link
                key={account.id}
                to="/account/$accountId"
                params={{ accountId: account.id.toString() }}
                className="block"
              >
                {account.bank === 'bmo' && account.type === 'creditcard' ? (
                  <CreditCardAccountCard
                    account={account}
                    transactions={transactionsMap.get(account.id)}
                  />
                ) : account.bank === 'rbc' && account.type === 'chequing' ? (
                  <RbcChequingAccountCard
                    account={account}
                    transactions={transactionsMap.get(account.id)}
                  />
                ) : (
                  <DefaultAccountCard account={account} />
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 mb-6">
            <p className="text-gray-500">No accounts connected</p>
          </div>
        )}

        <div className="flex">
          <Button fullWidth onClick={() => setShowAddModal(true)}>Add Account</Button>
        </div>
      </div>

      {showAddModal && (
        <AddAccountModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false)
            window.location.reload()
          }}
        />
      )}
    </div>
  )
}
