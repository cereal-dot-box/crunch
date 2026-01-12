import { HeadContent, Outlet, Scripts, createRootRoute, Link } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { QueryClientProvider } from '@tanstack/react-query'

import appCss from '../styles.css?url'
import { authQuery } from '../lib/authQuery'
import { queryClient } from '../router'

export const Route = createRootRoute({
  beforeLoad: async ({ context }) => {
    console.log('[__root] beforeLoad starting')
    try {
      // Check cache first, only fetch if not cached
      let auth = context.queryClient.getQueryData(authQuery.queryKey)

      if (!auth) {
        // Only fetch if not in cache (uses query's staleTime)
        auth = await context.queryClient.fetchQuery(authQuery)
      }

      console.log('[__root] auth result:', auth)
      return { auth }
    } catch (error) {
      console.error('[__root] auth error:', error)
      throw error
    }
  },
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Crunch - Personal Finance Tracker',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

  shellComponent: RootDocument,
  component: RootLayout,
  notFoundComponent: NotFound,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}

function RootLayout() {
  return (
    <div className="min-h-screen bg-white">
      <Outlet />
    </div>
  )
}

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-black">404</h1>
        <p className="mt-4 text-xl text-black">Page not found</p>
        <p className="mt-2 text-black">The page you're looking for doesn't exist.</p>
        <Link
          to="/"
          className="mt-6 inline-block px-6 py-3 bg-emerald-600 text-white font-medium border border-black hover:bg-emerald-700"
        >
          Go home
        </Link>
      </div>
    </div>
  )
}
