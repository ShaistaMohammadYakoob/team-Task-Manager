import { cn } from '../utils/cn.js';

const variants = {
  primary:
    'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20 hover:bg-cyan-500 focus:ring-cyan-500/30 dark:bg-cyan-400 dark:text-slate-950 dark:hover:bg-cyan-300',
  secondary:
    'border border-slate-200 bg-white text-slate-700 hover:border-cyan-300 hover:text-cyan-700 focus:ring-cyan-500/20 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:border-cyan-300',
  ghost:
    'text-slate-600 hover:bg-slate-100 hover:text-slate-950 focus:ring-slate-400/20 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white',
  danger:
    'bg-rose-600 text-white shadow-lg shadow-rose-600/20 hover:bg-rose-500 focus:ring-rose-500/30',
  subtle:
    'bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-400/20 dark:bg-white/10 dark:text-slate-100 dark:hover:bg-white/15'
};

const sizes = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  icon: 'h-10 w-10 p-0'
};

export const Button = ({ children, className, variant = 'primary', size = 'md', icon: Icon, type = 'button', ...props }) => (
  <button
    type={type}
    className={cn(
      'inline-flex items-center justify-center gap-2 rounded-lg font-semibold outline-none transition duration-200 hover:-translate-y-0.5 focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0',
      variants[variant],
      sizes[size],
      className
    )}
    {...props}
  >
    {Icon ? <Icon className="h-4 w-4" /> : null}
    {children}
  </button>
);
