import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { listTransactions } from '../../server'
import { Card } from '../../components/ui'

export const Route = createFileRoute('/_protected/income')({
  loader: async () => {
    const transactionsData = await listTransactions({ data: { limit: 1000, offset: 0 } })
    const incomeTransactions = transactionsData.transactions.filter(tx => tx.amount > 0)
    const total = incomeTransactions.reduce((sum, tx) => sum + tx.amount, 0)
    return { transactions: incomeTransactions, total }
  },
  component: IncomePage,
  ssr: true,
})

function IncomePage() {
  const { transactions, total } = Route.useLoaderData()
  const navigate = useNavigate()

  return (
    <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        {/* Header */}
        <div className="mb-6">
          <button onClick={() => navigate({ to: '/' })} className="text-sm text-gray-600 hover:text-gray-900 mb-2">
            ← Back
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-black">Income</h1>
          <p className="mt-1 text-3xl font-semibold text-emerald-600">${total.toFixed(2)}</p>
        </div>

        {/* Transactions */}
        <Card>
          <h3 className="text-lg font-medium text-black mb-4">Transactions</h3>
          {transactions.length > 0 ? (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {transactions.map((tx) => (
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
                  <p className="text-sm font-medium text-emerald-600">
                    +${tx.amount.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">No income transactions</p>
          )}
        </Card>
      </div>
    </div>
  )
}
