import { createFileRoute, Link } from '@tanstack/react-router'
import { listAccounts } from '../../server/accounts'
import { listTransactionsByAccount } from '../../server/transactions'
import { CreditCardAccountCard, DefaultAccountCard, RbcChequingAccountCard, Button } from '../../components/ui'
import { AddAccountModal } from '../../components/accounts/AddAccountModal'
import { useState } from 'react'

export const Route = createFileRoute('/_protected/accounts')({
  loader: async () => {
    const accountsData = await listAccounts()
    const accounts = accountsData.accounts

    // Fetch transactions for each account
    const transactionsResults = await Promise.all(
      accounts.map(account =>
        listTransactionsByAccount({ data: { accountId: account.id, limit: 100, offset: 0 } })
      )
    )

    const transactionsMap: Record<number, any[]> = {}
    accounts.forEach((account, index) => {
      transactionsMap[account.id] = transactionsResults[index].transactions
    })

    return { accounts, transactionsMap }
  },
  component: AccountsPage,
  ssr: true,
})

function AccountsPage() {
  const { accounts, transactionsMap } = Route.useLoaderData()
  const [showAddModal, setShowAddModal] = useState(false)

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-black">Accounts</h1>
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
                    transactions={transactionsMap[account.id]}
                  />
                ) : account.bank === 'rbc' && account.type === 'chequing' ? (
                  <RbcChequingAccountCard
                    account={account}
                    transactions={transactionsMap[account.id]}
                  />
                ) : (
                  <DefaultAccountCard account={account} />
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 mb-6">
            <p className="text-black">No accounts connected</p>
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
