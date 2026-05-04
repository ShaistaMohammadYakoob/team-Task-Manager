import { X } from 'lucide-react';
import { Button } from './Button.jsx';

export const Modal = ({ open, title, children, onClose, size = 'md' }) => {
  if (!open) return null;

  const widths = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className={`glass-panel max-h-[92vh] w-full ${widths[size]} overflow-hidden rounded-2xl`}>
        <div className="flex items-center justify-between border-b border-slate-200/80 px-5 py-4 dark:border-white/10">
          <h2 className="text-lg font-bold text-slate-950 dark:text-white">{title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="max-h-[calc(92vh-72px)] overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
};
