import Modal from './Modal';
import Button from './Button';
import { AlertTriangle } from 'lucide-react';

/**
 * ConfirmDialog
 * Props:
 *   open: boolean
 *   onClose: () => void
 *   onConfirm: () => void
 *   title: string
 *   message: string
 *   confirmLabel: string
 *   variant: 'danger' | 'primary'
 *   loading: boolean
 */
export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmLabel = 'Confirm',
  variant = 'danger',
  loading = false,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant={variant} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex flex-col items-center text-center gap-4 py-2">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
          variant === 'danger' ? 'bg-red-50' : 'bg-primary/10'
        }`}>
          <AlertTriangle
            size={22}
            className={variant === 'danger' ? 'text-status-lost' : 'text-primary'}
          />
        </div>
        <div>
          <h3 className="text-base font-bold text-text-primary">{title}</h3>
          <p className="text-sm text-text-secondary mt-1.5">{message}</p>
        </div>
      </div>
    </Modal>
  );
}
