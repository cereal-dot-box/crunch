import { useState } from 'react'
import { updateMonthlyPeriod, closeMonthlyPeriod } from '../../server/income'
import type { MonthlyPeriod } from '../../types'

interface Props {
  period: MonthlyPeriod
  onClose: () => void
}

function formatMonthLabel(month: string): string {
  const [year, monthNum] = month.split('-')
  const date = new Date(parseInt(year), parseInt(monthNum) - 1, 1)
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export function EditMonthModal({ period, onClose }: Props) {
  const [projectedIncome, setProjectedIncome] = useState(period.projected_income.toString())
  const [actualIncome, setActualIncome] = useState(period.actual_income.toString())
  const [notes, setNotes] = useState(period.notes || '')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: Record<string, string> = {}

    // Validate projected income
    const projectedNum = parseFloat(projectedIncome)
    if (!projectedIncome || isNaN(projectedNum) || projectedNum < 0) {
      newErrors.projectedIncome = 'Projected income must be a positive number'
    }

    // Validate actual income
    const actualNum = parseFloat(actualIncome)
    if (!actualIncome || isNaN(actualNum) || actualNum < 0) {
      newErrors.actualIncome = 'Actual income must be a positive number'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsSubmitting(true)
    setErrors({})

    try {
      await updateMonthlyPeriod({
        data: {
          id: period.id,
          input: {
            projected_income: projectedNum,
            actual_income: actualNum,
            notes: notes || undefined,
          },
        },
      })
      onClose()
    } catch (err: any) {
      setErrors({ form: err?.message || 'Failed to update month' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCloseMonth = async () => {
    const newErrors: Record<string, string> = {}

    // Validate actual income before closing
    const actualNum = parseFloat(actualIncome)
    if (!actualIncome || isNaN(actualNum) || actualNum < 0) {
      newErrors.actualIncome = 'Actual income must be a positive number to close month'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    if (confirm('Are you sure you want to close this month? You will not be able to modify the projected income after closing.')) {
      setIsClosing(true)
      try {
        await closeMonthlyPeriod({ data: { id: period.id } })
        onClose()
      } catch (err: any) {
        setErrors({ form: err?.message || 'Failed to close month' })
        setIsClosing(false)
      }
    }
  }

  const isOpen = period.is_open

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white border border-black max-w-md w-full p-6">
        <h2 className="text-xl font-semibold text-black mb-4">
          Edit {formatMonthLabel(period.month)}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Month (read-only) */}
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Month
            </label>
            <input
              type="text"
              value={period.month}
              disabled
              className="w-full px-3 py-2 border border-black bg-gray-100 text-black"
            />
          </div>

          {/* Status (read-only) */}
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Status
            </label>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 border text-xs font-medium ${
                isOpen ? 'border-[#0000EE] text-[#0000EE]' : 'border-black text-black'
              }`}>
                {period.status}
              </span>
              {!isOpen && <span className="text-sm text-black">(Cannot modify projected income when closed)</span>}
            </div>
          </div>

          {/* Projected Income */}
          <div>
            <label htmlFor="projectedIncome" className="block text-sm font-medium text-black mb-1">
              Projected Income {isOpen ? '' : '(locked)'}
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
                disabled={!isOpen}
                className={`w-full pl-7 pr-3 py-2 border border-black ${
                  errors.projectedIncome ? 'border-red-600' : ''
                } ${!isOpen ? 'bg-gray-100 text-black' : ''}`}
              />
            </div>
            {errors.projectedIncome && <p className="mt-1 text-sm text-red-600">{errors.projectedIncome}</p>}
          </div>

          {/* Actual Income */}
          <div>
            <label htmlFor="actualIncome" className="block text-sm font-medium text-black mb-1">
              Actual Income
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-black">$</span>
              <input
                type="number"
                id="actualIncome"
                value={actualIncome}
                onChange={(e) => setActualIncome(e.target.value)}
                step="0.01"
                min="0"
                className={`w-full pl-7 pr-3 py-2 border border-black ${
                  errors.actualIncome ? 'border-red-600' : ''
                }`}
              />
            </div>
            {errors.actualIncome && <p className="mt-1 text-sm text-red-600">{errors.actualIncome}</p>}
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-black mb-1">
              Notes
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
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>

          {/* Close Month Button */}
          {isOpen && (
            <div className="pt-2 border-t border-black">
              <button
                type="button"
                onClick={handleCloseMonth}
                disabled={isClosing}
                className="w-full px-4 py-2 bg-gray-600 text-white border border-black hover:bg-gray-700 disabled:opacity-50"
              >
                {isClosing ? 'Closing...' : 'Close Month'}
              </button>
              <p className="mt-2 text-xs text-black text-center">
                Closing the month will lock the projected income. You can still edit actual income and notes.
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
