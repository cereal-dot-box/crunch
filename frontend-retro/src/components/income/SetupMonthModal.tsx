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
      <div className="bg-white border border-black max-w-md w-full p-6">
        <h2 className="text-xl font-semibold text-black mb-4">Set Up Monthly Income</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Month */}
          <div>
            <label htmlFor="month" className="block text-sm font-medium text-black mb-1">
              Month
            </label>
            <input
              type="month"
              id="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className={`w-full px-3 py-2 border border-black ${
                errors.month ? 'border-red-600' : ''
              }`}
            />
            {errors.month && <p className="mt-1 text-sm text-red-600">{errors.month}</p>}
          </div>

          {/* Projected Income */}
          <div>
            <label htmlFor="projectedIncome" className="block text-sm font-medium text-black mb-1">
              Projected Income
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-black">$</span>
              <input
                type="number"
                id="projectedIncome"
                value={projectedIncome}
                onChange={(e) => setProjectedIncome(e.target.value)}
                step="0.01"
                min="0"
                placeholder="0.00"
                className={`w-full pl-7 pr-3 py-2 border border-black ${
                  errors.projectedIncome ? 'border-red-600' : ''
                }`}
              />
            </div>
            {errors.projectedIncome && <p className="mt-1 text-sm text-red-600">{errors.projectedIncome}</p>}
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-black mb-1">
              Notes (optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="e.g., Base salary, expected bonus, etc."
              className="w-full px-3 py-2 border border-black"
            />
          </div>

          {/* Error message */}
          {errors.form && <p className="text-sm text-red-600">{errors.form}</p>}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-black text-black"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-emerald-600 text-white border border-black hover:bg-emerald-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
