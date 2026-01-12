import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { logout as logoutFn } from '../server/auth'
import { authQuery } from '../lib/authQuery'
import { loggers } from '../lib/logger'

const log = loggers.auth

export const Route = createFileRoute('/logout')({
  component: LogoutPage,
})

function LogoutPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  useEffect(() => {
    const doLogout = async () => {
      log.info('Starting logout')
      try {
        const result = await logoutFn({})
        log.debug('Logout result:', result)
      } catch (e) {
        log.error('Logout error:', e)
      }

      // Invalidate the auth cache so the login page gets fresh data
      queryClient.invalidateQueries(authQuery)

      log.debug('Redirecting to /login')
      navigate({ to: '/login' })
    }
    doLogout()
  }, [navigate, queryClient])

  return null
}
