import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Wrench, Check, X, Paperclip, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import MaintenanceCard from '../components/maintenance/MaintenanceCard';
import ApprovalStepper from '../components/maintenance/ApprovalStepper';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import SearchBar from '../components/common/SearchBar';
import StatusBadge from '../components/common/StatusBadge';
import { mockMaintenance, mockAssets } from '../utils/mockData';
import { MAINTENANCE_STATUS, PRIORITY } from '../utils/constants';
import { formatDate } from '../utils/helpers';

// POST /api/maintenance                        { assetId, type, priority, description, notes }
// POST /api/maintenance/:id/approve            { notes }
// POST /api/maintenance/:id/reject             { reason }
// POST /api/maintenance/:id/schedule           { vendor, scheduledDate, estimatedCost }
// POST /api/maintenance/:id/complete           { completedDate, notes, actualCost }
// GET  /api/maintenance/overdue

export default function Maintenance() {
  const [records, setRecords] = useState(mockMaintenance);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [detailItem, setDetailItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const { register: regSched, handleSubmit: handleSched, formState: { errors: schedErrors } } = useForm();

  const filtered = useMemo(() => records.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch = !q || r.assetName.toLowerCase().includes(q) || r.description.toLowerCase().includes(q);
    const matchStatus = !filterStatus || r.status === filterStatus;
    return matchSearch && matchStatus;
  }), [records, search, filterStatus]);

  const handleCreate = async (data) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    // TODO: const { data: mnt } = await requestMaintenance(data);
    const asset = mockAssets.find((a) => a.id === data.assetId);
    setRecords((prev) => [...prev, {
      id: `mnt-${Date.now()}`,
      assetId: data.assetId, assetName: asset?.name || 'Unknown', assetTag: asset?.tag || '',
      type: data.type, priority: data.priority, status: 'Requested',
      requestedBy: 'You', requestedDate: new Date().toISOString(),
      approvedBy: null, approvedDate: null, vendor: null, scheduledDate: null,
      completedDate: null, estimatedCost: 0, description: data.description, notes: data.notes || '',
      steps: [
        { label: 'Requested', completed: true, date: new Date().toISOString().split('T')[0] },
        { label: 'Approved', completed: false, date: null },
        { label: 'Scheduled', completed: false, date: null },
        { label: 'In Progress', completed: false, date: null },
        { label: 'Completed', completed: false, date: null },
      ],
    }]);
    toast.success('Maintenance request submitted');
    setLoading(false);
    setCreateOpen(false);
    reset();
  };

  const handleApprove = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    // TODO: await approveMaintenance(detailItem.id);
    setRecords((prev) => prev.map((r) => r.id === detailItem.id
      ? { ...r, status: 'Approved', approvedBy: 'You', approvedDate: new Date().toISOString(),
          steps: r.steps.map((s) => s.label === 'Approved' ? { ...s, completed: true, date: formatDate(new Date()) } : s) }
      : r));
    toast.success('Maintenance approved');
    setLoading(false);
    setDetailItem(null);
  };

  const handleReject = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    // TODO: await rejectMaintenance(detailItem.id, { reason: 'Rejected' });
    setRecords((prev) => prev.map((r) => r.id === detailItem.id ? { ...r, status: 'Rejected' } : r));
    toast.error('Maintenance request rejected');
    setLoading(false);
    setDetailItem(null);
  };

  const handleSchedule = async (data) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    // TODO: await scheduleMaintenance(detailItem.id, data);
    setRecords((prev) => prev.map((r) => r.id === detailItem.id
      ? { ...r, status: 'In Progress', vendor: data.vendor, scheduledDate: data.scheduledDate, estimatedCost: Number(data.estimatedCost),
          steps: r.steps.map((s) =>
            s.label === 'Scheduled' ? { ...s, completed: true, date: data.scheduledDate } :
            s.label === 'In Progress' ? { ...s, completed: true, date: data.scheduledDate } : s) }
      : r));
    toast.success('Maintenance scheduled');
    setLoading(false);
    setScheduleOpen(false);
    setDetailItem(null);
  };

  const statusOptions = ['', 'Requested', 'Approved', 'Scheduled', 'In Progress', 'Completed', 'Rejected'];

  const counts = records.reduce((acc, r) => { acc[r.status] = (acc[r.status] || 0) + 1; return acc; }, {});

  return (
    <div className="af-page max-w-screen-xl mx-auto">
      {/* Header */}
      <div className="af-page-header">
        <div>
          <h1 className="af-page-title">Maintenance</h1>
          <p className="af-page-subtitle">Request, approve, schedule, and track asset maintenance</p>
        </div>
        <Button variant="primary" icon={<Plus size={15} />} onClick={() => setCreateOpen(true)}>
          Request Maintenance
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Requested', value: counts['Requested'] || 0, color: '#FFB300' },
          { label: 'Approved', value: counts['Approved'] || 0, color: '#4CAF50' },
          { label: 'In Progress', value: (counts['In Progress'] || 0) + (counts['Scheduled'] || 0), color: '#1976D2' },
          { label: 'Completed', value: counts['Completed'] || 0, color: '#5E244E' },
        ].map((s) => (
          <div key={s.label} className="bg-surface rounded-card border border-border p-4">
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-text-secondary mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by asset or description…" className="sm:w-72" />
        <div className="flex gap-2 flex-wrap sm:ml-auto">
          {statusOptions.map((s) => (
            <button key={s || 'all'} onClick={() => setFilterStatus(s)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-all ${filterStatus === s ? 'bg-primary text-white border-primary' : 'bg-surface border-border text-text-secondary hover:border-primary/40'}`}>
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Grid */}
      {filtered.length === 0 ? (
        <p className="text-center py-12 text-sm text-text-muted">No maintenance records found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <MaintenanceCard key={item.id} maintenance={item} onClick={setDetailItem} />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal open={createOpen} onClose={() => { setCreateOpen(false); reset(); }} title="Request Maintenance" size="sm"
        footer={<><Button variant="ghost" onClick={() => { setCreateOpen(false); reset(); }} disabled={loading}>Cancel</Button><Button variant="primary" onClick={handleSubmit(handleCreate)} loading={loading}>Submit Request</Button></>}>
        <div className="space-y-4">
          <div>
            <label className="af-label">Asset</label>
            <select className="af-select" {...register('assetId', { required: 'Required' })}>
              <option value="">Select asset…</option>
              {mockAssets.filter((a) => a.status !== 'Retired' && a.status !== 'Disposed').map((a) => (
                <option key={a.id} value={a.id}>{a.name} — {a.status}</option>
              ))}
            </select>
            {errors.assetId && <p className="mt-1 text-xs text-status-lost">{errors.assetId.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="af-label">Type</label>
              <select className="af-select" {...register('type', { required: true })}>
                <option value="Corrective">Corrective</option>
                <option value="Preventive">Preventive</option>
                <option value="Inspection">Inspection</option>
              </select>
            </div>
            <div>
              <label className="af-label">Priority</label>
              <select className="af-select" {...register('priority', { required: true })}>
                {Object.values(PRIORITY).map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="af-label">Description</label>
            <textarea className="af-input resize-none" rows={3} placeholder="Describe the issue or maintenance needed…" {...register('description', { required: 'Required' })} />
            {errors.description && <p className="mt-1 text-xs text-status-lost">{errors.description.message}</p>}
          </div>
          <div>
            <label className="af-label">Notes (optional)</label>
            <textarea className="af-input resize-none" rows={2} {...register('notes')} />
          </div>
          {/* Attachment placeholder */}
          <div className="flex items-center gap-2 px-3 py-2.5 border border-dashed border-border rounded-button cursor-pointer hover:border-primary/40 transition-colors text-text-muted">
            <Paperclip size={14} />
            <span className="text-xs">Attach files (backend: POST /api/maintenance/:id/attachments)</span>
          </div>
        </div>
      </Modal>

      {/* Detail Modal */}
      <AnimatePresence>
        {detailItem && (
          <Modal
            open={Boolean(detailItem)}
            onClose={() => setDetailItem(null)}
            title={detailItem.assetName}
            size="lg"
            footer={
              <div className="flex gap-2 w-full">
                <Button variant="ghost" onClick={() => setDetailItem(null)}>Close</Button>
                <div className="ml-auto flex gap-2">
                  {detailItem.status === 'Requested' && (
                    <>
                      <Button variant="danger" size="sm" icon={<X size={13} />} onClick={handleReject} loading={loading}>Reject</Button>
                      <Button variant="accent" size="sm" icon={<Check size={13} />} onClick={handleApprove} loading={loading}>Approve</Button>
                    </>
                  )}
                  {detailItem.status === 'Approved' && (
                    <Button variant="primary" size="sm" icon={<Calendar size={13} />} onClick={() => setScheduleOpen(true)}>Schedule</Button>
                  )}
                </div>
              </div>
            }
          >
            <div className="space-y-5">
              {/* Stepper */}
              <div className="pt-2">
                <p className="text-xs text-text-muted mb-4 font-medium uppercase tracking-wide">Workflow Progress</p>
                <ApprovalStepper steps={detailItem.steps} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-3">
                  {[
                    ['Status', <StatusBadge key="s" status={detailItem.status} size="sm" />],
                    ['Type', detailItem.type],
                    ['Priority', detailItem.priority],
                    ['Requested By', detailItem.requestedBy],
                    ['Requested On', formatDate(detailItem.requestedDate)],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between">
                      <span className="text-xs text-text-muted">{k}</span>
                      <span className="text-xs font-medium text-text-primary">{v}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  {[
                    ['Approved By', detailItem.approvedBy || '—'],
                    ['Vendor', detailItem.vendor || '—'],
                    ['Scheduled Date', detailItem.scheduledDate ? formatDate(detailItem.scheduledDate) : '—'],
                    ['Est. Cost', detailItem.estimatedCost ? `$${detailItem.estimatedCost}` : '—'],
                    ['Completed', detailItem.completedDate ? formatDate(detailItem.completedDate) : '—'],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between">
                      <span className="text-xs text-text-muted">{k}</span>
                      <span className="text-xs font-medium text-text-primary">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-border">
                <p className="text-xs text-text-muted mb-1">Description</p>
                <p className="text-sm text-text-secondary">{detailItem.description}</p>
              </div>

              {/* Attachment placeholder */}
              <div className="p-3 bg-background rounded-button border border-dashed border-border">
                <div className="flex items-center gap-2 text-text-muted">
                  <Paperclip size={14} />
                  <span className="text-xs">Attachments placeholder — backend: GET /api/maintenance/:id/attachments</span>
                </div>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Schedule Modal */}
      {scheduleOpen && detailItem && (
        <Modal open={scheduleOpen} onClose={() => setScheduleOpen(false)} title="Schedule Maintenance" size="sm"
          footer={<><Button variant="ghost" onClick={() => setScheduleOpen(false)} disabled={loading}>Cancel</Button><Button variant="primary" onClick={handleSched(handleSchedule)} loading={loading}>Save Schedule</Button></>}>
          <div className="space-y-4">
            <Input label="Vendor / Technician" placeholder="TechFix Solutions" error={schedErrors.vendor?.message} {...regSched('vendor', { required: 'Required' })} />
            <Input label="Scheduled Date" type="date" error={schedErrors.scheduledDate?.message} {...regSched('scheduledDate', { required: 'Required' })} />
            <Input label="Estimated Cost (USD)" type="number" step="0.01" placeholder="0.00" {...regSched('estimatedCost')} />
          </div>
        </Modal>
      )}
    </div>
  );
}
