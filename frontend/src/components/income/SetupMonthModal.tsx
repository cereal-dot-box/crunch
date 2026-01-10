import { useState } from 'react'
import { createMonthlyPeriod } from '../../server/income'

interface Props {
  onClose: () => void
}

export function SetupMonthModal({ onClose }: Props) {
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7)) // YYYY-MM
  const [projectedIncome, setProjectedIncome] = useState('')
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: Record<string, string> = {}

    // Validate month format (YYYY-MM)
    if (!month.match(/^\d{4}-(0[1-9]|1[0-2])$/)) {
      newErrors.month = 'Month must be in YYYY-MM format'
    }

    // Validate projected income
    const incomeNum = parseFloat(projectedIncome)
    if (!projectedIncome || isNaN(incomeNum) || incomeNum < 0) {
      newErrors.projectedIncome = 'Projected income must be a positive number'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsSubmitting(true)
    setErrors({})

    try {
      await createMonthlyPeriod({
        data: {
          month,
          projected_income: incomeNum,
          notes: notes || undefined,
        },
      })
      onClose()
    } catch (err: any) {
      setErrors({ form: err?.message || 'Failed to create month' })
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Set Up Monthly Income</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Month */}
          <div>
            <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-1">
              Month
            </label>
            <input
              type="month"
              id="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.month ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.month && <p className="mt-1 text-sm text-red-600">{errors.month}</p>}
          </div>

          {/* Projected Income */}
          <div>
            <label htmlFor="projectedIncome" className="block text-sm font-medium text-gray-700 mb-1">
              Projected Income
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                id="projectedIncome"
                value={projectedIncome}
                onChange={(e) => setProjectedIncome(e.target.value)}
                step="0.01"
                min="0"
                placeholder="0.00"
                className={`w-full pl-7 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.projectedIncome ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.projectedIncome && <p className="mt-1 text-sm text-red-600">{errors.projectedIncome}</p>}
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes (optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="e.g., Base salary, expected bonus, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Error message */}
          {errors.form && <p className="text-sm text-red-600">{errors.form}</p>}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
