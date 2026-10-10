import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/', label: 'Dashboard', icon: '▦' },
  { to: '/problems', label: 'Problems', icon: '≡' },
  { to: '/review', label: 'Review', icon: '↻' },
  { to: '/categories', label: 'Categories', icon: '◈' },
  { to: '/tags', label: 'Tags', icon: '⊕' },
  { to: '/notes', label: 'Notes', icon: '✎' },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();
  return (
    <div className="flex min-h-screen bg-zinc-50 text-zinc-900">
      <nav className="w-52 shrink-0 bg-zinc-950 flex flex-col p-4 border-r border-zinc-800/50">
        <div className="mb-8 px-2 pt-2">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold leading-none">LC</span>
            </div>
            <h1 className="text-sm font-semibold text-white tracking-tight">LC Tracker</h1>
          </div>
          <p className="text-xs text-zinc-600 pl-8">Interview Prep</p>
        </div>

        <div className="flex flex-col gap-0.5">
          {navItems.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                  isActive
                    ? 'bg-white/10 text-white font-medium'
                    : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.06]'
                }`
              }
            >
              <span className="text-base leading-none opacity-80">{icon}</span>
              {label}
            </NavLink>
          ))}
        </div>

        <div className="mt-auto pt-4 border-t border-zinc-800 flex flex-col gap-1">
          <p className="text-xs text-zinc-700 px-3 pb-1">6-month prep tracker</p>
          <button
            onClick={logout}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-zinc-600 hover:text-zinc-200 hover:bg-white/[0.06] transition-all w-full text-left"
          >
            <span className="text-base leading-none">→</span>
            Sign out
          </button>
        </div>
      </nav>
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}
