import { CheckSquare, FolderKanban, LayoutDashboard, LogOut, Menu, ShieldCheck, Users, UserRound, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { Button } from './Button.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { cn } from '../utils/cn.js';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/admin', label: 'Admin Panel', icon: ShieldCheck, adminOnly: true },
  { to: '/profile', label: 'Profile', icon: UserRound }
];

export const Sidebar = ({ open, onClose }) => {
  const { user, logout } = useAuth();

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-30 bg-slate-950/50 backdrop-blur-sm transition lg:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white/90 p-4 shadow-2xl backdrop-blur-xl transition-transform duration-300 dark:border-white/10 dark:bg-slate-950/90 lg:static lg:translate-x-0 lg:shadow-none',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-cyan-300 shadow-glow dark:bg-white dark:text-slate-950">
              <CheckSquare className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-extrabold text-slate-950 dark:text-white">Team Task</p>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Manager</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onClose} aria-label="Close menu">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {navItems
            .filter((item) => !item.adminOnly || user?.role === 'admin')
            .map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition duration-200',
                    isActive
                      ? 'bg-slate-950 text-white shadow-soft dark:bg-white dark:text-slate-950'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white'
                  )
                }
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            ))}
        </nav>

        <div className="border-t border-slate-200 pt-4 dark:border-white/10">
          {user?.role === 'admin' ? (
            <div className="mb-3 rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-2 text-xs font-bold uppercase tracking-wide text-cyan-700 dark:border-cyan-300/20 dark:bg-cyan-300/10 dark:text-cyan-200">
              Admin Mode Active
            </div>
          ) : null}
          <Button variant="ghost" className="w-full justify-start" icon={LogOut} onClick={logout}>
            Sign out
          </Button>
        </div>
      </aside>
    </>
  );
};

export const MobileMenuButton = ({ onClick }) => (
  <Button variant="ghost" size="icon" className="lg:hidden" onClick={onClick} aria-label="Open menu">
    <Menu className="h-5 w-5" />
  </Button>
);
