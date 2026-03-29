import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/', label: 'Dashboard', icon: '▦' },
  { to: '/problems', label: 'Problems', icon: '≡' },
  { to: '/categories', label: 'Categories', icon: '◈' },
  { to: '/tags', label: 'Tags', icon: '⊕' },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();
  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      <nav className="w-52 shrink-0 bg-white border-r border-gray-200 flex flex-col p-4 shadow-sm">
        <div className="mb-8 px-2">
          <h1 className="text-lg font-bold text-gray-900 tracking-tight">LC Tracker</h1>
          <p className="text-xs text-gray-400 mt-0.5">Interview Prep</p>
        </div>
        <div className="flex flex-col gap-0.5">
          {navItems.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-medium'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`
              }
            >
              <span className="text-base">{icon}</span>
              {label}
            </NavLink>
          ))}
        </div>
        <div className="mt-auto pt-4 border-t border-gray-100 flex flex-col gap-2">
          <p className="text-xs text-gray-400 px-2">6-month prep tracker</p>
          <button
            onClick={logout}
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors w-full text-left"
          >
            <span className="text-base">→</span>
            Sign out
          </button>
        </div>
      </nav>
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}
