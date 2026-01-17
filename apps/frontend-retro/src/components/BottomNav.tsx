import { Link, useMatchRoute } from '@tanstack/react-router';
import {
  ChartBarIcon,
  BuildingLibraryIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

export function BottomNav() {
  const matchRoute = useMatchRoute();

  const navItems = [
    { to: '/', label: 'Dashboard', icon: ChartBarIcon },
    { to: '/accounts', label: 'Accounts', icon: BuildingLibraryIcon },
    { to: '/monthly', label: 'Income', icon: CurrencyDollarIcon },
  ];

  return (
    <nav
      className="fixed bottom-0 inset-x-0 bg-white border-t border-black md:hidden"
      style={{ zIndex: 'var(--z-bottom-nav)' }}
    >
      <div className="grid grid-cols-3 gap-1">
        {navItems.map((item) => {
          const isActive = matchRoute({ to: item.to, fuzzy: false });
          const Icon = item.icon;

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center py-2 min-h-[56px] text-xs font-medium transition-colors ${
                isActive
                  ? 'text-black font-bold underline'
                  : 'text-[#0000EE] hover:underline'
              }`}
            >
              <Icon className="h-6 w-6 mb-1" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
