import { useForm } from 'react-hook-form';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { mockEmployees } from '../../utils/mockData';
import { AlertTriangle } from 'lucide-react';

/**
 * TransferDialog
 * POST /api/allocations/:id/transfer { newEmployeeId, reason, notes }
 */
export default function TransferDialog({ open, onClose, allocation, onConfirm, loading }) {
  const { register, handleSubmit, formState: { errors } } = useForm();

  if (!allocation) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Transfer Asset"
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit(onConfirm)} loading={loading}>Transfer</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="p-3 bg-primary/5 rounded-button border border-primary/15">
          <p className="text-xs font-semibold text-primary">{allocation.assetName}</p>
          <p className="text-xs text-text-secondary">Currently assigned to {allocation.employeeName}</p>
        </div>

        <div>
          <label className="af-label">Transfer To</label>
          <select className="af-select" {...register('newEmployeeId', { required: 'Select an employee' })}>
            <option value="">Select employee…</option>
            {mockEmployees.filter((e) => e.id !== allocation.employeeId).map((e) => (
              <option key={e.id} value={e.id}>{e.name} — {e.department}</option>
            ))}
          </select>
          {errors.newEmployeeId && <p className="mt-1 text-xs text-status-lost">{errors.newEmployeeId.message}</p>}
        </div>

        <Input label="Reason for Transfer" placeholder="e.g. Role change, department move…" error={errors.reason?.message}
          {...register('reason', { required: 'Required' })} />

        <div>
          <label className="af-label">Notes (optional)</label>
          <textarea className="af-input resize-none" rows={2} {...register('notes')} />
        </div>

        <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-button border border-amber-200">
          <AlertTriangle size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700">The current allocation will be closed and a new one created for the recipient.</p>
        </div>
      </div>
    </Modal>
  );
}
