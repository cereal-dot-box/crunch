import { createFileRoute, useRouter, useSearch } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { initiateSplitwiseOAuth, completeSplitwiseOAuth, getSplitwiseCredential, disconnectSplitwise, getSplitwiseGroups } from '../../server/splitwise'

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

export const Route = createFileRoute('/_protected/splitwise-setup')({
  component: SplitwiseSetup,
})

function SplitwiseSetup() {
  const router = useRouter()
  const search = useSearch({ strict: false })
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'initiating' | 'redirecting' | 'success' | 'error' | 'connected' | 'disconnecting' | 'fetching'>('idle')
  const [credential, setCredential] = useState<{ id: number; splitwise_user_id: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasProcessedCallback, setHasProcessedCallback] = useState(false)
  const [groups, setGroups] = useState<SplitwiseGroup[]>([])
  const [groupsError, setGroupsError] = useState<string | null>(null)

  // Get URL params for callback (code and state from Splitwise redirect)
  const code = search?.code as string | undefined
  const stateParam = search?.state as string | undefined

  // Fetch connection status on mount
  useEffect(() => {
    getSplitwiseCredential()
      .then((result) => {
        if (result.connected && result.credential) {
          setCredential(result.credential)
          setStatus('connected')
        }
      })
      .catch(() => {
        // Not connected, that's fine
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  // Handle callback from Splitwise
  useEffect(() => {
    if (code && stateParam && !hasProcessedCallback && status === 'idle') {
      setHasProcessedCallback(true)
      setStatus('redirecting')

      completeSplitwiseOAuth({ data: { code, state: stateParam } })
        .then((result) => {
          setStatus('success')
          setCredential(result.credential)
          // Redirect to accounts after a delay
          setTimeout(() => {
            router.navigate({ to: '/accounts' })
          }, 2000)
        })
        .catch((err: Error) => {
          setError(err.message)
          setStatus('error')
        })
    }
  }, [code, stateParam, hasProcessedCallback, status, router])

  // Show loading state while redirecting/processing callback
  if (status === 'redirecting' || (code && stateParam)) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-black mb-4">Connecting to Splitwise...</h1>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          </div>
        </div>
      </div>
    )
  }

  const handleConnect = async () => {
    setError(null)
    setStatus('initiating')

    try {
      const result = await initiateSplitwiseOAuth()
      // Redirect to Splitwise - state is already embedded in the URL by the backend
      window.location.href = result.authorize_url
    } catch (err: any) {
      setError(err.message || 'Failed to initiate OAuth flow')
      setStatus('error')
    }
  }

  const handleDisconnect = async () => {
    setError(null)
    setStatus('disconnecting')

    try {
      await disconnectSplitwise()
      setCredential(null)
      setGroups([])
      setStatus('idle')
    } catch (err: any) {
      setError(err.message || 'Failed to disconnect Splitwise')
      setStatus('error')
    }
  }

  const handleFetchGroups = async () => {
    setGroupsError(null)
    setStatus('fetching')

    try {
      const result = await getSplitwiseGroups()
      setGroups(result.groups)
      setStatus('connected')
    } catch (err: any) {
      setGroupsError(err.message || 'Failed to fetch groups from Splitwise')
      setStatus('connected')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.navigate({ to: '/accounts' })}
          className="text-black mb-6"
        >
          ← Back to Accounts
        </button>

        <div className="bg-white border border-gray-200 rounded-lg p-8">
          <h1 className="text-3xl font-bold text-black mb-2">Splitwise Integration</h1>
          <p className="text-gray-600 mb-8">
            Sync your Splitwise expenses with crunch to track shared expenses alongside your personal finances.
          </p>

          {status === 'success' ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-green-800 mb-2">Successfully Connected!</h2>
              <p className="text-green-700">Redirecting you to your accounts...</p>
            </div>
          ) : status === 'connected' && credential ? (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h2 className="text-xl font-bold text-green-800 mb-2">Connected to Splitwise</h2>
                <p className="text-green-700">
                  Your account is connected. Splitwise user ID: <span className="font-mono text-sm">{credential.splitwise_user_id}</span>
                </p>
              </div>

              <button
                onClick={handleFetchGroups}
                disabled={status === 'fetching'}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {status === 'fetching' ? 'Fetching...' : 'Test: Fetch Groups from Splitwise'}
              </button>

              <button
                onClick={() => router.navigate({ to: '/splitwise-settings' })}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700"
              >
                Configure Settings
              </button>

              {groups.length > 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-black mb-4">Your Splitwise Groups</h3>
                  <div className="space-y-4">
                    {groups.map((group) => (
                      <div key={group.id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-black mb-2">{group.name}</h4>
                        <p className="text-sm text-gray-500 mb-3">Updated: {new Date(group.updated_at).toLocaleDateString()}</p>
                        <div className="text-sm">
                          <p className="font-medium text-gray-700 mb-1">Members ({group.members.length}):</p>
                          <ul className="list-disc list-inside text-gray-600 space-y-1">
                            {group.members.map((member) => (
                              <li key={member.id}>
                                {member.first_name} {member.last_name || ''} ({member.email})
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {groupsError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm">{groupsError}</p>
                </div>
              )}

              <button
                onClick={handleDisconnect}
                disabled={status === 'disconnecting'}
                className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {status === 'disconnecting' ? 'Disconnecting...' : 'Disconnect Splitwise'}
              </button>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-black mb-2">How it works:</h3>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700">
                    <li>Click the button below to authorize crunch to access your Splitwise account</li>
                    <li>You'll be redirected to Splitwise to log in and authorize</li>
                    <li>Once authorized, we'll fetch your expenses automatically</li>
                  </ol>
                </div>

                <button
                  onClick={handleConnect}
                  disabled={status === 'initiating'}
                  className="w-full bg-black text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {status === 'initiating' ? 'Connecting...' : 'Connect with Splitwise'}
                </button>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 text-sm">{error}</p>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800 text-sm">
                    <strong>Note:</strong> OAuth credentials are configured in the backend environment variables:
                  </p>
                  <ul className="list-disc list-inside text-blue-700 text-sm mt-2">
                    <li>SPLITWISE_CLIENT_ID</li>
                    <li>SPLITWISE_CLIENT_SECRET</li>
                    <li>SPLITWISE_REDIRECT_URI (defaults to http://localhost:3000/splitwise-setup)</li>
                  </ul>
                  <p className="text-blue-800 text-sm mt-2">
                    Register your app at:{' '}
                    <a href="https://secure.splitwise.com/oauth/applications" target="_blank" rel="noopener noreferrer" className="underline">
                      secure.splitwise.com/oauth/applications
                    </a>
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
