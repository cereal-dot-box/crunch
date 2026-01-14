import { createFileRoute, Link } from '@tanstack/react-router'
import { listTransactions, listBudgets, getCurrentPeriod } from '../../server'
import { Card, ProgressBar } from '../../components/ui'
import { DEFAULT_BUDGETS, categorizeToBucket } from '../../config/budgets'
import { useMemo } from 'react'
import { AiChat } from '../../components/AiChat'

export const Route = createFileRoute('/_protected/')({
  loader: async () => {
    const [transactionsData, userBudgets, currentPeriod] = await Promise.all([
      listTransactions({ data: { limit: 1000, offset: 0 } }),
      listBudgets(),
      getCurrentPeriod(),
    ])
    return {
      transactions: transactionsData.transactions,
      userBudgets,
      currentPeriod,
    }
  },
  component: Dashboard,
  ssr: true,
})

function Dashboard() {
  const { transactions, userBudgets, currentPeriod } = Route.useLoaderData()

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

  // Calculate income, outgoing totals, and category spending
  const { totals, categorySpending } = useMemo(() => {
    const stats = { income: 0, outgoing: 0 }
    const spending: Record<string, number> = {}

    // Initialize spending for each category
    categories.forEach(cat => {
      spending[cat.bucket_id] = 0
    })

    transactions.forEach((tx) => {
      if (tx.amount < 0) {
        stats.outgoing += Math.abs(tx.amount)

        // Categorize the transaction
        const bucketId = categorizeToBucket(tx.category_name, tx.category_hierarchy)
        if (spending[bucketId] !== undefined) {
          spending[bucketId] += Math.abs(tx.amount)
        }
      } else {
        stats.income += tx.amount
      }
    })

    return { totals: stats, categorySpending: spending }
  }, [transactions, categories])

  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-black">{currentMonth}</h1>
        </div>

        {/* Should Save This Month */}
        <div className="mb-6">
          <Card clickable={false}>
            <div>
              <p className="text-sm font-medium text-black">Should Save This Month</p>
              <p className={`mt-1 text-3xl font-semibold ${
                (currentPeriod?.projected_income || totals.income) - totals.outgoing >= 0
                  ? 'text-emerald-600'
                  : 'text-red-600'
              }`}>
                ${((currentPeriod?.projected_income || totals.income) - totals.outgoing).toFixed(2)}
              </p>
            </div>
          </Card>
        </div>

        {/* Projected Income & Outgoing */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:gap-6 mb-8">
          <Card clickable={false}>
            <div>
              <p className="text-sm font-medium text-black">Projected Income</p>
              <p className="mt-1 text-3xl font-semibold text-black">
                ${currentPeriod?.projected_income?.toFixed(2) || '0.00'}
              </p>
            </div>
          </Card>

          <Link to="/income" className="block">
            <Card clickable className="cursor-pointer">
              <div>
                <p className="text-sm font-medium text-black">Income</p>
                <p className="mt-1 text-3xl font-semibold text-emerald-600">
                  ${totals.income.toFixed(2)}
                </p>
              </div>
            </Card>
          </Link>

          <Link to="/outgoing" className="block">
            <Card clickable className="cursor-pointer">
              <div>
                <p className="text-sm font-medium text-black">Outgoing</p>
                <p className="mt-1 text-3xl font-semibold text-red-600">
                  ${totals.outgoing.toFixed(2)}
                </p>
              </div>
            </Card>
          </Link>
        </div>

        {/* Outgoing Categories */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-black mb-4">Outgoing</h2>
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

        {/* AI Chat */}
        <div className="mb-8">
          <AiChat />
        </div>

      </div>
    </div>
  )
}
