import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { logout as logoutFn } from '../server/auth'
import { authQuery } from '../lib/authQuery'

export const Route = createFileRoute('/logout')({
  component: LogoutPage,
})

function LogoutPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  useEffect(() => {
    const doLogout = async () => {
      console.log('[logout route] Starting logout')
      try {
        const result = await logoutFn({})
        console.log('[logout route] Logout result:', result)
      } catch (e) {
        console.error('[logout route] Logout error:', e)
      }

      // Invalidate the auth cache so the login page gets fresh data
      queryClient.invalidateQueries(authQuery)

      console.log('[logout route] Redirecting to /login')
      navigate({ to: '/login' })
    }
    doLogout()
  }, [navigate, queryClient])

  return null
}
