import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { checkStatus, register as registerFn } from '../server/auth'
import { Input, Button } from '../components/ui'

export const Route = createFileRoute('/setup')({
  beforeLoad: async () => {
    try {
      const { isSetup, isAuthenticated } = await checkStatus()
      if (isSetup && isAuthenticated) {
        throw redirect({ to: '/' })
      }
      if (isSetup && !isAuthenticated) {
        throw redirect({ to: '/login' })
      }
    } catch (error) {
      if (error instanceof Response) throw error
    }
  },
  component: SetupPage,
  ssr: false,
})

function SetupPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 12) {
      setError('Password must be at least 12 characters')
      return
    }

    setIsLoading(true)

    try {
      // Use a default admin email for setup
      await registerFn({ data: { email: 'admin@crunch.local', password } })
      navigate({ to: '/' })
    } catch (err: any) {
      const errorMessage =
        err?.message ||
        'Setup failed. Please try again.'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome to Crunch
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Set up your password to get started
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <Input
                id="password"
                name="password"
                type="password"
                required
                placeholder="Password (min 12 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              disabled={isLoading}
              fullWidth
            >
              {isLoading ? 'Setting up...' : 'Complete Setup'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
