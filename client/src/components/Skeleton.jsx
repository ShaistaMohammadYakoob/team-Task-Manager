import { cn } from '../utils/cn.js';

export const Skeleton = ({ className }) => (
  <div className={cn('animate-pulse rounded-lg bg-slate-200/80 dark:bg-white/10', className)} />
);

export const CardSkeleton = () => (
  <div className="app-surface rounded-xl p-5">
    <Skeleton className="mb-4 h-4 w-28" />
    <Skeleton className="mb-3 h-8 w-20" />
    <Skeleton className="h-3 w-full" />
  </div>
);
