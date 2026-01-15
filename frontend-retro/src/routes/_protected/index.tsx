import { createFileRoute, Link } from '@tanstack/react-router'
import { listTransactions, getCurrentPeriod } from '../../server'
import { Card } from '../../components/ui'
import { useMemo } from 'react'
import { AiChat } from '../../components/AiChat'

export const Route = createFileRoute('/_protected/')({
  loader: async () => {
    const [transactionsData, currentPeriod] = await Promise.all([
      listTransactions({ data: { limit: 1000, offset: 0 } }),
      getCurrentPeriod(),
    ])
    return {
      transactions: transactionsData.transactions,
      currentPeriod,
    }
  },
  component: Dashboard,
  ssr: true,
})

function Dashboard() {
  const { transactions, currentPeriod } = Route.useLoaderData()

  // Calculate income and outgoing totals
  const totals = useMemo(() => {
    const stats = { income: 0, outgoing: 0 }

    transactions.forEach((tx) => {
      if (tx.amount < 0) {
        stats.outgoing += Math.abs(tx.amount)
      } else {
        stats.income += tx.amount
      }
    })

    return stats
  }, [transactions])

  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-black">{currentMonth}</h1>
        </div>

        {/* Should Save This Month & Projected Income */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 mb-6">
          <div className="sm:col-span-3">
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
          <div className="sm:col-span-1">
            <Card clickable={false}>
              <div>
                <p className="text-sm font-medium text-black">Projected Income</p>
                <p className="mt-1 text-3xl font-semibold text-black">
                  ${currentPeriod?.projected_income?.toFixed(2) || '0.00'}
                </p>
              </div>
            </Card>
          </div>
        </div>

        {/* AI Chat */}
        <div className="mb-6">
          <AiChat />
        </div>

        {/* Income & Outgoing */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-6 mb-8">
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

      </div>
    </div>
  )
}
