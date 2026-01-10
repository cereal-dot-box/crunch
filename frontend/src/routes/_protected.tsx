import { createFileRoute, redirect, Outlet, Link, useNavigate } from '@tanstack/react-router'
import { BottomNav } from '../components/BottomNav'
import { logout as logoutFn } from '../server/auth'

export const Route = createFileRoute('/_protected')({
  beforeLoad: ({ context }) => {
    if (!context.auth?.isAuthenticated) {
      throw redirect({ to: '/login' })
    }
  },
  component: ProtectedLayout,
})

function ProtectedLayout() {
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logoutFn()
      navigate({ to: '/login' })
    } catch (error) {
      console.error('Logout failed:', error)
      // Still navigate to login even if logout fails
      navigate({ to: '/login' })
    }
  }

  return (
    <>
      {/* Desktop top navbar */}
      <nav className="bg-white shadow-sm hidden md:flex">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex space-x-8">
              <Link
                to="/"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-indigo-600"
              >
                Dashboard
              </Link>
              <Link
                to="/accounts"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                Accounts
              </Link>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="ml-4 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Logout
              </button>
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
