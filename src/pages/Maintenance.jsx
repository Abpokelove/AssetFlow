import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { AnimatePresence } from 'framer-motion';
import { Plus, Check, X, Calendar, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import MaintenanceCard from '../components/maintenance/MaintenanceCard';
import ApprovalStepper from '../components/maintenance/ApprovalStepper';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import SearchBar from '../components/common/SearchBar';
import StatusBadge from '../components/common/StatusBadge';
import { getAssets } from '../services/api/assetService';
import {
  approveMaintenance,
  getMaintenanceRequests,
  rejectMaintenance,
  requestMaintenance,
  scheduleMaintenance,
} from '../services/api/maintenanceService';
import { apiErrorMessage, unwrapList, unwrapPage } from '../services/api/responseUtils';
import { PRIORITY } from '../utils/constants';
import { formatDate } from '../utils/helpers';

const DISPLAY_STATUS = {
  PENDING: 'Requested',
  REQUESTED: 'Requested',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  TECHNICIAN_ASSIGNED: 'Scheduled',
  SCHEDULED: 'Scheduled',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Completed',
  COMPLETED: 'Completed',
};

const normalizeStatus = (status) => {
  if (!status) return 'Requested';
  return DISPLAY_STATUS[String(status).toUpperCase()] || status;
};

const normalizePriority = (priority) => {
  if (!priority) return 'Medium';
  const value = String(priority).toLowerCase();
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const maintenanceSteps = (item) => {
  const status = normalizeStatus(item.status);
  const requestedDate = item.requestedDate || item.createdAt || item.created_at;
  return [
    { label: 'Requested', completed: true, date: requestedDate ? formatDate(requestedDate) : null },
    { label: 'Approved', completed: ['Approved', 'Scheduled', 'In Progress', 'Completed'].includes(status), date: item.approvedDate || item.approved_at || null },
    { label: 'Scheduled', completed: ['Scheduled', 'In Progress', 'Completed'].includes(status), date: item.scheduledDate || item.scheduled_at || null },
    { label: 'In Progress', completed: ['In Progress', 'Completed'].includes(status), date: item.startedAt || item.started_at || null },
    { label: 'Completed', completed: status === 'Completed', date: item.completedDate || item.resolved_at || null },
  ];
};

const normalizeMaintenance = (item) => ({
  ...item,
  id: item.id,
  assetId: item.assetId || item.asset_id,
  assetName: item.assetName || item.asset_name || item.assetTag || item.asset_id || 'Asset',
  assetTag: item.assetTag || item.asset_tag || item.asset_id || '',
  type: item.type || item.requestType || item.request_type || 'Corrective',
  priority: normalizePriority(item.priority),
  status: normalizeStatus(item.status),
  requestedBy: item.requestedBy || item.reporterName || item.reporter_name || item.reporter_id || 'Unknown',
  requestedDate: item.requestedDate || item.createdAt || item.created_at,
  approvedBy: item.approvedBy || item.approverName || item.approver_name || item.approver_id,
  approvedDate: item.approvedDate || item.approved_at,
  vendor: item.vendor || item.technicianName || item.technician_name || item.technician_id,
  scheduledDate: item.scheduledDate || item.scheduled_at,
  completedDate: item.completedDate || item.resolved_at,
  estimatedCost: item.estimatedCost ?? item.estimated_cost,
  description: item.description || item.issueDescription || item.issue_description || '',
  notes: item.notes || item.resolutionNotes || item.resolution_notes || '',
  steps: Array.isArray(item.steps) ? item.steps : maintenanceSteps(item),
});

export default function Maintenance() {
  const [records, setRecords] = useState([]);
  const [assets, setAssets] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [detailItem, setDetailItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');
  const [scheduleOpen, setScheduleOpen] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const { register: regSched, handleSubmit: handleSched, formState: { errors: schedErrors }, reset: resetSchedule } = useForm();

  const loadMaintenance = async () => {
    setPageLoading(true);
    setError('');
    try {
      const [maintenanceResponse, assetResponse] = await Promise.all([
        getMaintenanceRequests({ pageSize: 100 }),
        getAssets({ pageSize: 100 }),
      ]);
      setRecords(unwrapPage(maintenanceResponse).data.map(normalizeMaintenance));
      setAssets(unwrapPage(assetResponse).data);
    } catch (err) {
      setRecords([]);
      setError(apiErrorMessage(err, 'Maintenance API is not available yet.'));
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    loadMaintenance();
  }, []);

  const filtered = useMemo(() => records.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch = !q || r.assetName.toLowerCase().includes(q) || r.description.toLowerCase().includes(q);
    const matchStatus = !filterStatus || r.status === filterStatus;
    return matchSearch && matchStatus;
  }), [records, search, filterStatus]);

  const runMutation = async (action, successMessage) => {
    setLoading(true);
    try {
      await action();
      toast.success(successMessage);
      await loadMaintenance();
      setDetailItem(null);
      setScheduleOpen(false);
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data) => {
    await runMutation(async () => {
      await requestMaintenance(data);
      setCreateOpen(false);
      reset();
    }, 'Maintenance request submitted');
  };

  const handleApprove = async () => {
    await runMutation(() => approveMaintenance(detailItem.id), 'Maintenance approved');
  };

  const handleReject = async () => {
    await runMutation(() => rejectMaintenance(detailItem.id, { reason: 'Rejected from dashboard' }), 'Maintenance request rejected');
  };

  const handleSchedule = async (data) => {
    await runMutation(async () => {
      await scheduleMaintenance(detailItem.id, {
        ...data,
        estimatedCost: data.estimatedCost ? Number(data.estimatedCost) : undefined,
      });
      resetSchedule();
    }, 'Maintenance scheduled');
  };

  const statusOptions = ['', 'Requested', 'Approved', 'Scheduled', 'In Progress', 'Completed', 'Rejected'];
  const counts = records.reduce((acc, r) => { acc[r.status] = (acc[r.status] || 0) + 1; return acc; }, {});
  const selectableAssets = assets.filter((a) => !['Retired', 'Disposed'].includes(a.status));

  return (
    <div className="af-page max-w-screen-xl mx-auto">
      <div className="af-page-header">
        <div>
          <h1 className="af-page-title">Maintenance</h1>
          <p className="af-page-subtitle">Request, approve, schedule, and track asset maintenance</p>
        </div>
        <Button variant="primary" icon={<Plus size={15} />} onClick={() => setCreateOpen(true)}>
          Request Maintenance
        </Button>
      </div>

      {error && (
        <div className="mb-5 flex items-center justify-between gap-3 rounded-card border border-status-lost/30 bg-status-lost/5 p-3 text-sm text-status-lost">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={loadMaintenance}>Retry</Button>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Requested', value: counts.Requested || 0, color: '#FFB300' },
          { label: 'Approved', value: counts.Approved || 0, color: '#4CAF50' },
          { label: 'In Progress', value: (counts['In Progress'] || 0) + (counts.Scheduled || 0), color: '#1976D2' },
          { label: 'Completed', value: counts.Completed || 0, color: '#5E244E' },
        ].map((s) => (
          <div key={s.label} className="bg-surface rounded-card border border-border p-4">
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-text-secondary mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by asset or description..." className="sm:w-72" />
        <div className="flex gap-2 flex-wrap sm:ml-auto">
          {statusOptions.map((s) => (
            <button key={s || 'all'} onClick={() => setFilterStatus(s)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-all ${filterStatus === s ? 'bg-primary text-white border-primary' : 'bg-surface border-border text-text-secondary hover:border-primary/40'}`}>
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      {pageLoading ? (
        <p className="text-center py-12 text-sm text-text-muted">Loading maintenance requests...</p>
      ) : filtered.length === 0 ? (
        <p className="text-center py-12 text-sm text-text-muted">No maintenance records found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <MaintenanceCard key={item.id} maintenance={item} onClick={setDetailItem} />
          ))}
        </div>
      )}

      <Modal open={createOpen} onClose={() => { setCreateOpen(false); reset(); }} title="Request Maintenance" size="sm"
        footer={<><Button variant="ghost" onClick={() => { setCreateOpen(false); reset(); }} disabled={loading}>Cancel</Button><Button variant="primary" onClick={handleSubmit(handleCreate)} loading={loading}>Submit Request</Button></>}>
        <div className="space-y-4">
          <div>
            <label className="af-label">Asset</label>
            <select className="af-select" {...register('assetId', { required: 'Required' })}>
              <option value="">Select asset...</option>
              {selectableAssets.map((a) => (
                <option key={a.id} value={a.id}>{a.name} - {a.status}</option>
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
            <textarea className="af-input resize-none" rows={3} placeholder="Describe the issue or maintenance needed..." {...register('description', { required: 'Required' })} />
            {errors.description && <p className="mt-1 text-xs text-status-lost">{errors.description.message}</p>}
          </div>
          <div>
            <label className="af-label">Notes (optional)</label>
            <textarea className="af-input resize-none" rows={2} {...register('notes')} />
          </div>
        </div>
      </Modal>

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
                    ['Approved By', detailItem.approvedBy || '-'],
                    ['Vendor', detailItem.vendor || '-'],
                    ['Scheduled Date', detailItem.scheduledDate ? formatDate(detailItem.scheduledDate) : '-'],
                    ['Est. Cost', detailItem.estimatedCost ? `$${detailItem.estimatedCost}` : '-'],
                    ['Completed', detailItem.completedDate ? formatDate(detailItem.completedDate) : '-'],
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
            </div>
          </Modal>
        )}
      </AnimatePresence>

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
