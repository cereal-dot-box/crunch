import { createFileRoute } from '@tanstack/react-router'
import { listMonthlyPeriods, getCurrentPeriod } from '../../server/income'
import { Card } from '../../components/ui'
import { useState } from 'react'
import { SetupMonthModal } from '../../components/income/SetupMonthModal'
import { EditMonthModal } from '../../components/income/EditMonthModal'
import type { MonthlyPeriod } from '../../types'

export const Route = createFileRoute('/_protected/monthly')({
  loader: async () => {
    const [periods, currentPeriod] = await Promise.all([
      listMonthlyPeriods(),
      getCurrentPeriod(),
    ])
    return { periods, currentPeriod }
  },
  component: MonthlyIncome,
  ssr: true,
})

function formatMonth(month: string): string {
  const [year, monthNum] = month.split('-')
  const date = new Date(parseInt(year), parseInt(monthNum) - 1, 1)
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function getDelta(period: MonthlyPeriod): number {
  return period.actual_income - period.projected_income
}

function MonthlyIncome() {
  const { periods, currentPeriod } = Route.useLoaderData()
  const [setupModalOpen, setSetupModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingPeriod, setEditingPeriod] = useState<MonthlyPeriod | null>(null)

  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const currentMonthStr = new Date().toISOString().slice(0, 7) // YYYY-MM format

  const currentPeriodForDisplay = periods.find((p: MonthlyPeriod) => p.month === currentMonthStr)
  const pastPeriods = periods.filter((p: MonthlyPeriod) => p.month !== currentMonthStr).sort((a, b) => b.month.localeCompare(a.month))

  const handleEdit = (period: MonthlyPeriod) => {
    setEditingPeriod(period)
    setEditModalOpen(true)
  }

  const handleDelete = (period: MonthlyPeriod) => {
    if (confirm(`Are you sure you want to delete ${formatMonth(period.month)}?`)) {
      alert('Delete functionality to be implemented')
    }
  }

  const handleCloseModal = () => {
    setSetupModalOpen(false)
    setEditModalOpen(false)
    setEditingPeriod(null)
    window.location.reload()
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Monthly Income</h1>
          <button
            onClick={() => setSetupModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Set Up Month
          </button>
        </div>

        <>
          {/* Current Month Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Month: {currentMonth}</h2>

            {currentPeriodForDisplay ? (
              <Card className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Projected Income</p>
                    <p className="mt-1 text-2xl font-semibold text-gray-900">
                      ${currentPeriodForDisplay.projected_income.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Actual Income</p>
                    <p className="mt-1 text-2xl font-semibold text-green-600">
                      ${currentPeriodForDisplay.actual_income.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <p className="mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        currentPeriodForDisplay.is_open
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {currentPeriodForDisplay.status}
                      </span>
                    </p>
                  </div>
                  {currentPeriodForDisplay.notes && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Notes</p>
                      <p className="mt-1 text-sm text-gray-700">{currentPeriodForDisplay.notes}</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleEdit(currentPeriodForDisplay)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Edit
                  </button>
                  {currentPeriodForDisplay.is_open && (
                    <button
                      onClick={() => handleDelete(currentPeriodForDisplay)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </Card>
            ) : (
              <Card className="p-6 text-center">
                <p className="text-gray-500 mb-4">No period set up for this month yet.</p>
                <button
                  onClick={() => setSetupModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Set Up This Month
                </button>
              </Card>
            )}
          </div>

          {/* History Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">History</h2>

            {pastPeriods.length === 0 ? (
              <Card className="p-6 text-center">
                <p className="text-gray-500">No previous months yet.</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {pastPeriods.map((period: MonthlyPeriod) => {
                  const delta = getDelta(period)
                  return (
                    <Card key={period.id} className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {formatMonth(period.month)}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              period.is_open
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {period.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            ${period.projected_income.toFixed(2)} vs ${period.actual_income.toFixed(2)}
                          </p>
                          <p className={`text-sm font-medium ${
                            delta >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {delta >= 0 ? '+' : ''}${delta.toFixed(2)} {delta >= 0 ? 'over' : 'under'} projected
                          </p>
                          {period.notes && (
                            <p className="text-sm text-gray-500 mt-1">{period.notes}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(period)}
                            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                          >
                            Edit
                          </button>
                          {period.is_open && (
                            <button
                              onClick={() => handleDelete(period)}
                              className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </>

        {/* Modals */}
        {setupModalOpen && (
          <SetupMonthModal onClose={handleCloseModal} />
        )}

        {editModalOpen && editingPeriod && (
          <EditMonthModal
            period={editingPeriod}
            onClose={handleCloseModal}
          />
        )}
      </div>
    </div>
  )
}
