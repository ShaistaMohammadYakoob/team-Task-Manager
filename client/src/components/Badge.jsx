import { cn } from '../utils/cn.js';

export const Badge = ({ children, className }) => (
  <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold', className)}>{children}</span>
);
