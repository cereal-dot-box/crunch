import { createFileRoute, redirect, Outlet } from '@tanstack/react-router'
import { checkStatus } from '../server/auth'

export const Route = createFileRoute('/_protected')({
  beforeLoad: async () => {
    try {
      console.log('[_protected] Calling checkStatus...')
      const result = await checkStatus()
      console.log('[_protected] checkStatus result:', result)
      if (!result.isAuthenticated) {
        throw redirect({ to: '/login' })
      }
    } catch (error) {
      console.log('[_protected] Caught error:', error)
      if (error instanceof Response) throw error
      // Re-throw redirects
      if (error && typeof error === 'object' && 'to' in error) throw error
      throw redirect({ to: '/login' })
    }
  },
  component: Outlet,
})
