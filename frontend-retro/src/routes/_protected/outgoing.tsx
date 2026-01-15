import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { listTransactions, listBudgets } from '../../server'
import { Card, ProgressBar } from '../../components/ui'
import { DEFAULT_BUDGETS, categorizeToBucket } from '../../config/budgets'
import { useMemo } from 'react'

export const Route = createFileRoute('/_protected/outgoing')({
  loader: async () => {
    const [transactionsData, userBudgets] = await Promise.all([
      listTransactions({ data: { limit: 1000, offset: 0 } }),
      listBudgets(),
    ])
    const outgoingTransactions = transactionsData.transactions.filter(tx => tx.amount < 0)
    const total = outgoingTransactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0)
    return { transactions: outgoingTransactions, total, userBudgets }
  },
  component: OutgoingPage,
  ssr: true,
})

function OutgoingPage() {
  const { transactions, total, userBudgets } = Route.useLoaderData()
  const navigate = useNavigate()

  // Get categories to display
  const categories = useMemo(() => {
    if (userBudgets && userBudgets.length > 0) {
      return userBudgets
    }
    return DEFAULT_BUDGETS.map(b => ({
      id: b.id,
      bucket_id: b.id,
      name: b.name,
      monthly_limit: b.monthlyLimit,
      color: b.color,
    }))
  }, [userBudgets])

  // Calculate category spending
  const categorySpending = useMemo(() => {
    const spending: Record<string, number> = {}
    categories.forEach(cat => {
      spending[cat.bucket_id] = 0
    })
    transactions.forEach((tx) => {
      const bucketId = categorizeToBucket(tx.category_name, tx.category_hierarchy)
      if (spending[bucketId] !== undefined) {
        spending[bucketId] += Math.abs(tx.amount)
      }
    })
    return spending
  }, [transactions, categories])

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        {/* Header */}
        <div className="mb-6">
          <button onClick={() => navigate({ to: '/' })} className="text-sm text-gray-600 hover:text-gray-900 mb-2">
            ← Back
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-black">Outgoing</h1>
          <p className="mt-1 text-3xl font-semibold text-red-600">${total.toFixed(2)}</p>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-black mb-4">Categories</h2>
          <div className="grid grid-cols-1 gap-4 lg:gap-6">
            {categories.map((category) => (
              <Link
                key={category.bucket_id}
                to="/bucket/$bucketId"
                params={{ bucketId: category.bucket_id }}
                className="block"
              >
                <Card className="cursor-pointer shadow-md hover:shadow-lg">
                  <div className="mb-3">
                    <h3 className="text-base font-medium text-black">
                      {category.name}
                    </h3>
                  </div>
                  <ProgressBar
                    current={categorySpending[category.bucket_id] || 0}
                    max={category.monthly_limit}
                    showValues
                    color={category.color}
                  />
                </Card>
              </Link>
            ))}
          </div>
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
                  <p className="text-sm font-medium text-red-600">
                    -${Math.abs(tx.amount).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">No outgoing transactions</p>
          )}
        </Card>
      </div>
    </div>
  )
}
