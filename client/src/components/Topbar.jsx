import { BriefcaseBusiness, Monitor, Moon, ShieldCheck, Sun } from 'lucide-react';
import { Button } from './Button.jsx';
import { MobileMenuButton } from './Sidebar.jsx';
import { Avatar } from './AvatarStack.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { getJobRoleLabel } from '../utils/teamRoles.js';

export const Topbar = ({ onMenuClick }) => {
  const { user } = useAuth();
  const { resolvedTheme, themeMode, toggleTheme, setThemeMode } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-slate-50/80 px-4 py-3 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/75 sm:px-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <MobileMenuButton onClick={onMenuClick} />
          <div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Workspace</p>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-bold text-slate-950 dark:text-white">{user?.name}</p>
              {user?.role === 'admin' ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-cyan-100 px-2 py-0.5 text-xs font-bold text-cyan-700 dark:bg-cyan-400/10 dark:text-cyan-300">
                  <ShieldCheck className="h-3 w-3" />
                  Admin
                </span>
              ) : null}
              <span className="hidden items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-300 sm:inline-flex">
                <BriefcaseBusiness className="h-3 w-3" />
                {getJobRoleLabel(user?.jobRole)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="relative h-9 w-16 rounded-full border border-slate-200 bg-white p-1 transition dark:border-white/10 dark:bg-white/10"
            aria-label="Toggle theme"
          >
            <span
              className={`absolute top-1 flex h-7 w-7 items-center justify-center rounded-full bg-slate-950 text-white transition dark:bg-cyan-300 dark:text-slate-950 ${
                isDark ? 'left-8' : 'left-1'
              }`}
            >
              {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </span>
          </button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setThemeMode(themeMode === 'system' ? resolvedTheme : 'system')}
            aria-label="Use system theme"
            title="System theme"
          >
            <Monitor className="h-5 w-5" />
          </Button>
          <Avatar user={user} />
        </div>
      </div>
    </header>
  );
};
