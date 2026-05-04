import { Button } from './Button.jsx';

export const EmptyState = ({ title, message, actionLabel, onAction }) => (
  <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white/60 p-8 text-center dark:border-white/10 dark:bg-white/5">
    <img src="/empty-state.svg" alt="" className="mb-4 h-36 w-auto" />
    <h3 className="text-lg font-bold text-slate-950 dark:text-white">{title}</h3>
    {message ? <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">{message}</p> : null}
    {actionLabel && onAction ? (
      <Button className="mt-5" onClick={onAction}>
        {actionLabel}
      </Button>
    ) : null}
  </div>
);
