import { createFileRoute, Link } from '@tanstack/react-router'
import { listTransactions, listBudgets, getCurrentPeriod } from '../../server'
import { Card, ProgressBar } from '../../components/ui'
import { DEFAULT_BUDGETS } from '../../config/budgets'
import { useMemo } from 'react'

export const Route = createFileRoute('/_protected/')({
  loader: async () => {
    const [transactionsData, userBuckets, currentPeriod] = await Promise.all([
      listTransactions({ data: { limit: 1000, offset: 0 } }),
      listBudgets(),
      getCurrentPeriod(),
    ])
    return {
      transactions: transactionsData.transactions,
      userBuckets,
      currentPeriod,
    }
  },
  component: Dashboard,
  ssr: true,
})

function Dashboard() {
  const { transactions, userBuckets, currentPeriod } = Route.useLoaderData()

  // Calculate budget stats
  const budgetStats = useMemo(() => {
    // Use user's custom buckets if available, otherwise defaults
    const bucketsToUse = userBuckets || DEFAULT_BUDGETS.map(b => ({
      id: b.id,
      bucket_id: b.id,
      name: b.name,
      monthly_limit: b.monthlyLimit,
      color: b.color,
    }))

    const stats = {
      income: 0,
      outgoing: 0,
      buckets: bucketsToUse.map((bucket) => ({
        ...bucket,
        spent: 0,
        remaining: bucket.monthly_limit,
      })),
    }

    transactions.forEach((tx) => {
      if (tx.amount < 0) {
        // Negative amount = expense/spending
        stats.outgoing += Math.abs(tx.amount)

        // Categorize into bucket
        const bucketId = 'fun' // Default for now since we don't have category names
        const bucket = stats.buckets.find((b) => b.bucket_id === bucketId)
        if (bucket) {
          bucket.spent += Math.abs(tx.amount)
          bucket.remaining = bucket.monthly_limit - bucket.spent
        }
      } else {
        // Positive amount = income/deposit
        stats.income += tx.amount
      }
    })

    return stats
  }, [transactions, userBuckets])

  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-black">{currentMonth}</h1>
        </div>

        {/* Should Save This Month */}
        <div className="mb-8">
          <Card clickable={false}>
            <div>
              <p className="text-sm font-medium text-black">Should Save This Month</p>
              <p className={`mt-1 text-3xl font-semibold ${
                (currentPeriod?.projected_income || budgetStats.income) - budgetStats.outgoing >= 0
                  ? 'text-emerald-600'
                  : 'text-red-600'
              }`}>
                ${((currentPeriod?.projected_income || budgetStats.income) - budgetStats.outgoing).toFixed(2)}
              </p>
            </div>
          </Card>
        </div>

        {/* Budget Buckets */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-black mb-4">Buckets</h2>

          <div className="grid grid-cols-1 gap-4 lg:gap-6">
            {budgetStats.buckets.map((bucket) => (
              <Link
                key={bucket.bucket_id}
                to="/bucket/$bucketId"
                params={{ bucketId: bucket.bucket_id }}
                className="block"
              >
                <Card className="cursor-pointer shadow-md hover:shadow-lg">
                  <div className="mb-3">
                    <h3 className="text-base font-medium text-black">
                      {bucket.name}
                    </h3>
                  </div>
                  <ProgressBar
                    current={bucket.spent}
                    max={bucket.monthly_limit}
                    showValues
                    color={bucket.color}
                  />
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Income, Outgoing, and Projected Summary */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:gap-6 mb-8">
          <Card clickable={false}>
            <div>
              <p className="text-sm font-medium text-black">Projected Income</p>
              <p className="mt-1 text-3xl font-semibold text-black">
                ${currentPeriod?.projected_income?.toFixed(2) || '0.00'}
              </p>
            </div>
          </Card>

          <Card clickable={false}>
            <div>
              <p className="text-sm font-medium text-black">Income</p>
              <p className="mt-1 text-3xl font-semibold text-emerald-600">
                ${budgetStats.income.toFixed(2)}
              </p>
            </div>
          </Card>

          <Card clickable={false}>
            <div>
              <p className="text-sm font-medium text-black">Outgoing</p>
              <p className="mt-1 text-3xl font-semibold text-red-600">
                ${budgetStats.outgoing.toFixed(2)}
              </p>
            </div>
          </Card>
        </div>

      </div>
    </div>
  )
}
