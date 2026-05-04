import { AlertTriangle } from 'lucide-react';
import { Button } from './Button.jsx';
import { Modal } from './Modal.jsx';

export const ConfirmDialog = ({ open, title = 'Confirm action', message, confirmLabel = 'Delete', onConfirm, onClose, loading }) => (
  <Modal open={open} onClose={onClose} title={title} size="sm">
    <div className="flex gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-400/10 dark:text-rose-300">
        <AlertTriangle className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={loading}>
            {loading ? 'Working...' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  </Modal>
);
