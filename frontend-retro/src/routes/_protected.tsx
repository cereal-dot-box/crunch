import { createFileRoute, redirect, Outlet, Link, Navigate, useRouter } from '@tanstack/react-router'
import { BottomNav } from '../components/BottomNav'

export const Route = createFileRoute('/_protected')({
  beforeLoad: ({ context }) => {
    console.log('[_protected] beforeLoad, context.auth:', context.auth)

    if (!context.auth?.isAuthenticated) {
      console.log('[_protected] Not authenticated, redirecting to /login')
      throw redirect({ to: '/login' })
    }
    console.log('[_protected] Authenticated, proceeding')
  },
  component: ProtectedLayout,
  errorComponent: ProtectedErrorBoundary,
})

function ProtectedErrorBoundary({ error }: { error: Error }) {
  const router = useRouter()
  const errorMessage = error?.message?.toLowerCase() || ''

  // If error is auth-related, redirect to login immediately
  if (errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
    console.log('[_protected] Auth error caught, redirecting to /login')
    return <Navigate to="/login" />
  }

  // For non-auth errors, show a generic error message
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-black">Something went wrong</h1>
        <p className="mt-2 text-black">{error?.message}</p>
        <button
          onClick={() => router.navigate({ to: '/' })}
          className="mt-4 px-4 py-2 bg-black text-white"
        >
          Go home
        </button>
      </div>
    </div>
  )
}

function ProtectedLayout() {

  return (
    <>
      {/* Desktop top navbar */}
      <nav className="bg-white border-b border-black hidden md:flex">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16">
            <div className="flex gap-8 items-center">
              <Link
                to="/"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-black hover:underline"
              >
                Dashboard
              </Link>
              <Link
                to="/accounts"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-[#0000EE] hover:underline"
              >
                Accounts
              </Link>
              <Link
                to="/logout"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-[#0000EE] hover:underline"
              >
                Logout
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content with padding for mobile bottom nav */}
      <main className="pb-16 md:pb-0">
        <Outlet />
      </main>

      {/* Mobile bottom navbar */}
      <BottomNav />
    </>
  )
}
