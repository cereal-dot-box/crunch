import { createRouter } from '@tanstack/react-router'
import { QueryClient } from '@tanstack/react-query'
import type { CheckStatusResponse } from './server/auth'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

// Create a QueryClient for caching
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: false,
    },
  },
})

export function getRouter() {
  const router = createRouter({
    routeTree,
    context: {
      queryClient,
    },
    defaultPreload: 'intent',
    scrollRestoration: true,
  })

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
