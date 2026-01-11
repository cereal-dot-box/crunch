import { useState } from 'react'
import { addSyncSource } from '../../server/accounts'
import { Button } from '../ui'

interface AddProviderModalProps {
  accountId: number
  onClose: () => void
  onSuccess: () => void
}

export function AddProviderModal({ accountId, onClose, onSuccess }: AddProviderModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: '' as '' | 'balance' | 'transactions',
    email_address: '',
    imap_host: '',
    imap_port: 993,
    imap_password: '',
    imap_folder: 'INBOX',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      await addSyncSource({ data: { account_id: accountId, ...formData } })
      onSuccess()
    } catch (err: any) {
      setError(err?.message || 'Failed to add provider')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Add Provider</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Provider Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., BMO"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md h-[42px]"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value as 'balance' | 'transactions' })
                  }
                  required
                >
                  <option value="">Select type...</option>
                  <option value="transactions">Transactions</option>
                  <option value="balance">Balance</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={formData.email_address}
                onChange={(e) =>
                  setFormData({ ...formData, email_address: e.target.value })
                }
                placeholder="banking@example.com"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  IMAP Host
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={formData.imap_host}
                  onChange={(e) =>
                    setFormData({ ...formData, imap_host: e.target.value })
                  }
                  placeholder="imap.example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  IMAP Port
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={formData.imap_port}
                  onChange={(e) =>
                    setFormData({ ...formData, imap_port: parseInt(e.target.value) })
                  }
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                IMAP Password
              </label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={formData.imap_password}
                onChange={(e) =>
                  setFormData({ ...formData, imap_password: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                IMAP Folder
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={formData.imap_folder}
                onChange={(e) =>
                  setFormData({ ...formData, imap_folder: e.target.value })
                }
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? 'Adding...' : 'Add Provider'}
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
          </form>
        </div>
      </div>
    </div>
  )
}
