import { cn } from '../utils/cn.js';

export const Input = ({ label, error, className, ...props }) => (
  <label className="block">
    {label ? <span className="label">{label}</span> : null}
    <input className={cn('field', error && 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20', className)} {...props} />
    {error ? <span className="mt-1 block text-xs font-medium text-rose-500">{error}</span> : null}
  </label>
);

export const Textarea = ({ label, error, className, ...props }) => (
  <label className="block">
    {label ? <span className="label">{label}</span> : null}
    <textarea
      className={cn('field min-h-28 resize-y', error && 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20', className)}
      {...props}
    />
    {error ? <span className="mt-1 block text-xs font-medium text-rose-500">{error}</span> : null}
  </label>
);

export const Select = ({ label, error, children, className, ...props }) => (
  <label className="block">
    {label ? <span className="label">{label}</span> : null}
    <select className={cn('field', error && 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20', className)} {...props}>
      {children}
    </select>
    {error ? <span className="mt-1 block text-xs font-medium text-rose-500">{error}</span> : null}
  </label>
);
