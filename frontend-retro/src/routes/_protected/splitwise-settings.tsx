import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { getSplitwiseCredential, getSplitwiseGroups, getSplitwiseSettings, updateSplitwiseSettings } from '../../server/splitwise'

interface SplitwiseGroupMember {
  id: number
  first_name: string
  last_name: string | null
  email: string
}

interface SplitwiseGroup {
  id: number
  name: string
  updated_at: string
  members: SplitwiseGroupMember[]
}

interface SplitwiseSettings {
  id: number
  user_id: string
  included_group_ids: number[]
  auto_sync_enabled: boolean
  created_at: string
  updated_at: string
}

export const Route = createFileRoute('/_protected/splitwise-settings')({
  component: SplitwiseSettingsPage,
})

function SplitwiseSettingsPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<'loading' | 'loaded' | 'saving' | 'success' | 'error'>('loading')
  const [connected, setConnected] = useState(false)
  const [groups, setGroups] = useState<SplitwiseGroup[]>([])
  const [settings, setSettings] = useState<SplitwiseSettings | null>(null)
  const [selectedGroupIds, setSelectedGroupIds] = useState<Set<number>>(new Set())
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(false)

  // Fetch connection status and settings on mount
  useEffect(() => {
    Promise.all([
      getSplitwiseCredential(),
      getSplitwiseGroups(),
      getSplitwiseSettings(),
    ])
      .then(([credResult, groupsResult, settingsResult]) => {
        if (!credResult.connected) {
          // Redirect to setup if not connected
          router.navigate({ to: '/splitwise-setup' })
          return
        }

        setConnected(true)
        setGroups(groupsResult.groups)
        setSettings(settingsResult.settings)
        setSelectedGroupIds(new Set(settingsResult.settings.included_group_ids))
        setAutoSyncEnabled(settingsResult.settings.auto_sync_enabled)
        setStatus('loaded')
      })
      .catch((err) => {
        setError(err.message || 'Failed to load data')
        setStatus('error')
      })
  }, [router])

  const handleToggleGroup = (groupId: number) => {
    setSelectedGroupIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(groupId)) {
        newSet.delete(groupId)
      } else {
        newSet.add(groupId)
      }
      return newSet
    })
  }

  const handleToggleAutoSync = () => {
    setAutoSyncEnabled((prev) => !prev)
  }

  const handleSave = async () => {
    setError(null)
    setStatus('saving')

    try {
      const result = await updateSplitwiseSettings({
        data: {
          included_group_ids: Array.from(selectedGroupIds),
          auto_sync_enabled: autoSyncEnabled,
        },
      })

      setSettings(result.settings)
      setStatus('success')
      // Reset to 'loaded' after 2 seconds
      setTimeout(() => setStatus('loaded'), 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to save settings')
      setStatus('error')
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
      </div>
    )
  }

  if (!connected) {
    return null // Will redirect to setup
  }

  return (
    <div className="min-h-screen bg-white px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.navigate({ to: '/accounts' })}
          className="text-black mb-6"
        >
          {'←'} Back to Accounts
        </button>

        <div className="bg-white border border-gray-200 rounded-lg p-8">
          <h1 className="text-3xl font-bold text-black mb-2">Splitwise Settings</h1>
          <p className="text-gray-600 mb-8">
            Select which Splitwise groups to include in expense syncing.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {groups.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <p className="text-gray-700">No Splitwise groups found. Create a group in Splitwise first.</p>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-8">
                {groups.map((group) => (
                  <div
                    key={group.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedGroupIds.has(group.id)
                        ? 'bg-blue-50 border-blue-300'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleToggleGroup(group.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        <input
                          type="checkbox"
                          checked={selectedGroupIds.has(group.id)}
                          onChange={() => handleToggleGroup(group.id)}
                          className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-black">{group.name}</h3>
                        <p className="text-sm text-gray-500">
                          Members: {group.members.map((m) => m.first_name).join(', ')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Auto-sync toggle (for future use) */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-black">Auto-sync expenses</h3>
                    <p className="text-sm text-gray-500">
                      Automatically fetch expenses from selected groups
                    </p>
                  </div>
                  <button
                    onClick={handleToggleAutoSync}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      autoSyncEnabled ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        autoSyncEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={status === 'saving' || status === 'success'}
                className={`w-full py-3 px-6 rounded-lg font-semibold disabled:cursor-not-allowed ${
                  status === 'success'
                    ? 'bg-green-600 text-white'
                    : 'bg-black text-white hover:bg-gray-800 disabled:bg-gray-400'
                }`}
              >
                {status === 'saving' ? 'Saving...' : status === 'success' ? 'Saved!' : 'Save Settings'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
