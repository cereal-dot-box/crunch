import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { getAvailableBankTypes, addAccount } from '../../server/accounts'
import { Button } from '../ui'

interface AddAccountModalProps {
  onClose: () => void
  onSuccess: () => void
}

// Display names for banks and types
const BANK_LABELS: Record<string, string> = {
  splitwise: 'Splitwise',
  bmo: 'BMO',
  td: 'TD',
  rbc: 'RBC',
  cibc: 'CIBC',
  scotiabank: 'Scotiabank',
  chase: 'Chase',
  amex: 'American Express',
  manual: 'Manual',
}

const TYPE_LABELS: Record<string, string> = {
  creditcard: 'Credit Card',
  checking: 'Checking',
  chequing: 'Chequing',
  savings: 'Savings',
  mortgage: 'Mortgage',
  autoloan: 'Auto Loan',
  investment: 'Investment',
}

export function AddAccountModal({ onClose, onSuccess }: AddAccountModalProps) {
  const navigate = useNavigate()
  const [availableBankTypes, setAvailableBankTypes] = useState<any[]>([])
  const [isLoadingTypes, setIsLoadingTypes] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    bank: '',
    type: '',
    mask: '',
    iso_currency_code: 'CAD',
  })

  useEffect(() => {
    getAvailableBankTypes()
      .then(setAvailableBankTypes)
      .finally(() => setIsLoadingTypes(false))
  }, [])

  // Get available types for selected bank
  const availableTypes = availableBankTypes.find(b => b.bank === formData.bank)?.types || []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      await addAccount({ data: formData })
      onSuccess()
    } catch (err: any) {
      setError(err?.message || 'Failed to add account')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 pb-20 sm:pb-4">
      <div className="bg-white border border-black w-full max-w-md max-h-[85vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-black mb-4">Add Account</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Bank
                </label>
                <select
                  className="w-full px-3 py-2 border border-black"
                  value={formData.bank}
                  onChange={(e) =>
                    setFormData({ ...formData, bank: e.target.value, type: '' })
                  }
                  required
                  disabled={isLoadingTypes}
                >
                  <option value="">Select bank...</option>
                  {availableBankTypes.map((bt) => (
                    <option key={bt.bank} value={bt.bank}>
                      {BANK_LABELS[bt.bank] || bt.bank}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Type
                </label>
                <select
                  className="w-full px-3 py-2 border border-black"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  required
                  disabled={!formData.bank}
                >
                  <option value="">Select type...</option>
                  {availableTypes.map((type) => (
                    <option key={type} value={type}>
                      {TYPE_LABELS[type] || type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {formData.bank !== 'splitwise' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Account Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-black"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., My BMO Credit Card"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Mask (last 4 digits)
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-black"
                    value={formData.mask}
                    onChange={(e) =>
                      setFormData({ ...formData, mask: e.target.value })
                    }
                    placeholder="1234"
                    maxLength={4}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Currency
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-black"
                    value={formData.iso_currency_code}
                    onChange={(e) =>
                      setFormData({ ...formData, iso_currency_code: e.target.value })
                    }
                    required
                  >
                    <option value="USD">USD</option>
                    <option value="CAD">CAD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
              </>
            )}

            {error && (
              <div className="border border-red-600 text-red-600 p-3 text-sm">
                {error}
              </div>
            )}

            {formData.bank === 'splitwise' ? (
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  className="flex-1"
                  onClick={() => {
                    onClose()
                    navigate({ to: '/splitwise-setup' })
                  }}
                >
                  Connect with Splitwise
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? 'Adding...' : 'Add Account'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
