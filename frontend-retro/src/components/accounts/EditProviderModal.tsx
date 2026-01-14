import { useState } from 'react'
import { updateSyncSource } from '../../server/accounts'
import { Button } from '../ui'
import type { SyncSource } from '../../types'

interface EditProviderModalProps {
  provider: SyncSource
  onClose: () => void
  onSuccess: () => void
}

export function EditProviderModal({ provider, onClose, onSuccess }: EditProviderModalProps) {
  const [formData, setFormData] = useState({
    name: provider.name,
    email_address: provider.email_address,
    imap_host: provider.imap_host,
    imap_port: provider.imap_port,
    imap_password: '',
    imap_folder: provider.imap_folder,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      // Only include changed fields and password if provided
      const input: Record<string, unknown> = {}
      if (formData.name !== provider.name) input.name = formData.name
      if (formData.email_address !== provider.email_address) input.email_address = formData.email_address
      if (formData.imap_host !== provider.imap_host) input.imap_host = formData.imap_host
      if (formData.imap_port !== provider.imap_port) input.imap_port = formData.imap_port
      if (formData.imap_folder !== provider.imap_folder) input.imap_folder = formData.imap_folder
      if (formData.imap_password) input.imap_password = formData.imap_password

      await updateSyncSource({ data: { id: provider.id, input } })
      onSuccess()
    } catch (err: any) {
      setError(err?.message || 'Failed to update provider')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Edit Provider</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="Leave blank to keep current password"
              />
              <p className="text-xs text-gray-500 mt-1">Leave blank to keep current password</p>
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
                {isSubmitting ? 'Saving...' : 'Save Changes'}
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
