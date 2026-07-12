import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { AnimatePresence } from 'framer-motion';
import { Plus, Play, CheckCircle, AlertTriangle, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import AuditCard from '../components/audit/AuditCard';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import SearchBar from '../components/common/SearchBar';
import StatusBadge from '../components/common/StatusBadge';
import {
  completeAudit,
  createAudit,
  getAuditReport,
  getAudits,
  startAudit,
  verifyAsset,
} from '../services/api/auditService';
import { getAssets } from '../services/api/assetService';
import { getEmployees } from '../services/api/organizationService';
import { apiErrorMessage, downloadResponseBlob, unwrapPage } from '../services/api/responseUtils';
import { ASSET_CATEGORIES } from '../utils/constants';
import { formatDate } from '../utils/helpers';

const DISPLAY_STATUS = {
  DRAFT: 'Scheduled',
  SCHEDULED: 'Scheduled',
  ACTIVE: 'In Progress',
  IN_PROGRESS: 'In Progress',
  CLOSED: 'Completed',
  COMPLETED: 'Completed',
  DISCREPANCY_FOUND: 'Discrepancy Found',
};

const normalizeStatus = (status) => {
  if (!status) return 'Scheduled';
  return DISPLAY_STATUS[String(status).toUpperCase()] || status;
};

const normalizeAudit = (audit) => ({
  ...audit,
  id: audit.id,
  name: audit.name || audit.cycleName || 'Audit Cycle',
  category: audit.category || audit.assetCategory || 'All Categories',
  status: normalizeStatus(audit.status),
  auditor: audit.auditor || audit.auditorName || audit.createdByName || audit.creator_id || 'Unassigned',
  auditorId: audit.auditorId || audit.auditor_id,
  department: audit.department || audit.departmentName || audit.scope || audit.location_scope || 'All Departments',
  startDate: audit.startDate || audit.start_date,
  endDate: audit.endDate || audit.end_date,
  totalAssets: Number(audit.totalAssets ?? audit.total_assets ?? audit.itemCount ?? audit.item_count ?? 0),
  verified: Number(audit.verified ?? audit.verifiedCount ?? audit.verified_count ?? 0),
  discrepancies: Number(audit.discrepancies ?? audit.discrepancyCount ?? audit.discrepancy_count ?? 0),
  description: audit.description || audit.notes || '',
});

export default function Audit() {
  const [audits, setAudits] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [assets, setAssets] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [detailAudit, setDetailAudit] = useState(null);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const { register: regV, handleSubmit: handleV, formState: { errors: errV }, reset: resetVerification } = useForm();

  const loadAudits = async () => {
    setPageLoading(true);
    setError('');
    const [auditResult, employeeResult, assetResult] = await Promise.allSettled([
      getAudits({ pageSize: 100 }),
      getEmployees({ pageSize: 100 }),
      getAssets({ pageSize: 100 }),
    ]);

    if (auditResult.status === 'fulfilled') {
      setAudits(unwrapPage(auditResult.value).data.map(normalizeAudit));
    } else {
      setAudits([]);
      setError(apiErrorMessage(auditResult.reason, 'Audit API is not available yet.'));
    }

    if (employeeResult.status === 'fulfilled') {
      setEmployees(unwrapPage(employeeResult.value).data);
    }
    if (assetResult.status === 'fulfilled') {
      setAssets(unwrapPage(assetResult.value).data);
    }
    setPageLoading(false);
  };

  useEffect(() => {
    loadAudits();
  }, []);

  const filtered = useMemo(() => audits.filter((a) => {
    const q = search.toLowerCase();
    const matchSearch = !q || a.name.toLowerCase().includes(q) || a.auditor.toLowerCase().includes(q) || a.category.toLowerCase().includes(q);
    const matchStatus = !filterStatus || a.status === filterStatus;
    return matchSearch && matchStatus;
  }), [audits, search, filterStatus]);

  const runMutation = async (action, successMessage) => {
    setLoading(true);
    try {
      await action();
      toast.success(successMessage);
      await loadAudits();
      setDetailAudit(null);
      setVerifyOpen(false);
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data) => {
    if (data.startDate && data.endDate && data.startDate > data.endDate) {
      toast.error('End date must be after start date.');
      return;
    }
    await runMutation(async () => {
      await createAudit(data);
      setCreateOpen(false);
      reset();
    }, 'Audit created');
  };

  const handleStart = async () => {
    await runMutation(() => startAudit(detailAudit.id), 'Audit started');
  };

  const handleComplete = async () => {
    await runMutation(() => completeAudit(detailAudit.id), 'Audit completed');
  };

  const handleVerify = async (data) => {
    await runMutation(async () => {
      await verifyAsset(detailAudit.id, data.assetId, {
        ...data,
        hasDiscrepancy: data.hasDiscrepancy === 'true',
      });
      resetVerification();
    }, 'Asset verified');
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      const response = await getAuditReport(detailAudit.id);
      downloadResponseBlob(response, `${detailAudit.name || 'audit-report'}.pdf`, 'application/pdf');
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Audit report export is not available yet.'));
    } finally {
      setLoading(false);
    }
  };

  const counts = audits.reduce((acc, a) => { acc[a.status] = (acc[a.status] || 0) + 1; return acc; }, {});

  return (
    <div className="af-page max-w-screen-xl mx-auto">
      <div className="af-page-header">
        <div>
          <h1 className="af-page-title">Audit</h1>
          <p className="af-page-subtitle">Plan, execute, and report on asset audit cycles</p>
        </div>
        <Button variant="primary" icon={<Plus size={15} />} onClick={() => setCreateOpen(true)}>
          Create Audit
        </Button>
      </div>

      {error && (
        <div className="mb-5 flex items-center justify-between gap-3 rounded-card border border-status-lost/30 bg-status-lost/5 p-3 text-sm text-status-lost">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={loadAudits}>Retry</Button>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Scheduled', value: counts.Scheduled || 0, color: '#3F51B5' },
          { label: 'In Progress', value: counts['In Progress'] || 0, color: '#1976D2' },
          { label: 'Completed', value: counts.Completed || 0, color: '#4CAF50' },
          { label: 'Discrepancies', value: audits.reduce((s, a) => s + a.discrepancies, 0), color: '#C0392B' },
        ].map((s) => (
          <div key={s.label} className="bg-surface rounded-card border border-border p-4">
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-text-secondary mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <SearchBar value={search} onChange={setSearch} placeholder="Search audits..." className="sm:w-72" />
        <div className="flex gap-2 flex-wrap sm:ml-auto">
          {['', 'Scheduled', 'In Progress', 'Completed', 'Discrepancy Found'].map((s) => (
            <button key={s || 'all'} onClick={() => setFilterStatus(s)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-all ${filterStatus === s ? 'bg-primary text-white border-primary' : 'bg-surface border-border text-text-secondary hover:border-primary/40'}`}>
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      {pageLoading ? (
        <p className="text-center py-12 text-sm text-text-muted">Loading audits...</p>
      ) : filtered.length === 0 ? (
        <p className="text-center py-12 text-sm text-text-muted">No audits found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((audit) => <AuditCard key={audit.id} audit={audit} onClick={setDetailAudit} />)}
        </div>
      )}

      <Modal open={createOpen} onClose={() => { setCreateOpen(false); reset(); }} title="Create Audit" size="md"
        footer={<><Button variant="ghost" onClick={() => { setCreateOpen(false); reset(); }} disabled={loading}>Cancel</Button><Button variant="primary" onClick={handleSubmit(handleCreate)} loading={loading}>Create</Button></>}>
        <div className="space-y-4">
          <Input label="Audit Name" placeholder="Q1 2024 IT Equipment Audit" error={errors.name?.message} {...register('name', { required: 'Required' })} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="af-label">Asset Category</label>
              <select className="af-select" {...register('category', { required: 'Required' })}>
                <option value="">All Categories</option>
                {ASSET_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <p className="mt-1 text-xs text-status-lost">{errors.category.message}</p>}
            </div>
            <div>
              <label className="af-label">Auditor</label>
              <select className="af-select" {...register('auditorId', { required: 'Required' })}>
                <option value="">Assign auditor...</option>
                {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
              {errors.auditorId && <p className="mt-1 text-xs text-status-lost">{errors.auditorId.message}</p>}
            </div>
          </div>
          <Input label="Department / Scope" placeholder="All Departments" {...register('department')} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Start Date" type="date" error={errors.startDate?.message} {...register('startDate', { required: 'Required' })} />
            <Input label="End Date" type="date" error={errors.endDate?.message} {...register('endDate', { required: 'Required' })} />
          </div>
          <div>
            <label className="af-label">Description</label>
            <textarea className="af-input resize-none" rows={3} {...register('description')} />
          </div>
        </div>
      </Modal>

      <AnimatePresence>
        {detailAudit && (
          <Modal
            open={Boolean(detailAudit)}
            onClose={() => setDetailAudit(null)}
            title={detailAudit.name}
            size="lg"
            footer={
              <div className="flex gap-2 w-full">
                <Button variant="ghost" onClick={() => setDetailAudit(null)}>Close</Button>
                <div className="ml-auto flex gap-2">
                  {detailAudit.status !== 'Completed' && detailAudit.status !== 'Discrepancy Found' && (
                    <Button variant="outline" size="sm" icon={<CheckCircle size={13} />} onClick={() => { setVerifyOpen(true); }}>
                      Verify Asset
                    </Button>
                  )}
                  {detailAudit.status === 'Scheduled' && (
                    <Button variant="accent" size="sm" icon={<Play size={13} />} onClick={handleStart} loading={loading}>Start Audit</Button>
                  )}
                  {detailAudit.status === 'In Progress' && (
                    <Button variant="primary" size="sm" icon={<CheckCircle size={13} />} onClick={handleComplete} loading={loading}>Complete Audit</Button>
                  )}
                </div>
              </div>
            }
          >
            <div className="space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  ['Status', <StatusBadge key="s" status={detailAudit.status} size="sm" />],
                  ['Category', detailAudit.category],
                  ['Auditor', detailAudit.auditor],
                  ['Department', detailAudit.department],
                  ['Start Date', formatDate(detailAudit.startDate)],
                  ['End Date', formatDate(detailAudit.endDate)],
                ].map(([k, v]) => (
                  <div key={k}>
                    <p className="text-xs text-text-muted">{k}</p>
                    <p className="text-sm font-medium text-text-primary mt-0.5">{v}</p>
                  </div>
                ))}
              </div>

              {detailAudit.description && (
                <div className="p-3 bg-background rounded-button">
                  <p className="text-xs text-text-muted mb-1">Description</p>
                  <p className="text-sm text-text-secondary">{detailAudit.description}</p>
                </div>
              )}

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-xs font-medium text-text-secondary">Verification Progress</span>
                  <span className="text-xs font-bold text-text-primary">{detailAudit.verified}/{detailAudit.totalAssets}</span>
                </div>
                <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all"
                    style={{ width: detailAudit.totalAssets > 0 ? `${Math.round(detailAudit.verified / detailAudit.totalAssets * 100)}%` : '0%', backgroundColor: detailAudit.discrepancies > 0 ? '#C0392B' : '#4CAF50' }} />
                </div>
                {detailAudit.discrepancies > 0 && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <AlertTriangle size={13} className="text-status-lost" />
                    <p className="text-xs font-semibold text-status-lost">{detailAudit.discrepancies} discrepancies found</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" icon={<Download size={13} />} className="w-full" onClick={handleExport} loading={loading}>
                  Export Report (PDF)
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {verifyOpen && detailAudit && (
        <Modal open={verifyOpen} onClose={() => setVerifyOpen(false)} title="Verify Asset" size="sm"
          footer={<><Button variant="ghost" onClick={() => setVerifyOpen(false)} disabled={loading}>Cancel</Button><Button variant="primary" onClick={handleV(handleVerify)} loading={loading}>Submit Verification</Button></>}>
          <div className="space-y-4">
            <div>
              <label className="af-label">Asset</label>
              <select className="af-select" {...regV('assetId', { required: 'Required' })}>
                <option value="">Select asset to verify...</option>
                {assets.map((a) => <option key={a.id} value={a.id}>{a.name} ({a.tag})</option>)}
              </select>
              {errV.assetId && <p className="mt-1 text-xs text-status-lost">{errV.assetId.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="af-label">Physical Status</label>
                <select className="af-select" {...regV('physicalStatus')}>
                  <option>Present</option><option>Missing</option><option>Damaged</option>
                </select>
              </div>
              <div>
                <label className="af-label">Condition</label>
                <select className="af-select" {...regV('condition')}>
                  <option>Excellent</option><option>Good</option><option>Fair</option><option>Poor</option>
                </select>
              </div>
            </div>
            <Input label="Verified Location" placeholder="Building A, Floor 2..." {...regV('location')} />
            <div>
              <label className="af-label">Discrepancy?</label>
              <select className="af-select" {...regV('hasDiscrepancy')}>
                <option value="false">No Discrepancy</option>
                <option value="true">Discrepancy Found</option>
              </select>
            </div>
            <div>
              <label className="af-label">Discrepancy Note (if any)</label>
              <textarea className="af-input resize-none" rows={2} {...regV('discrepancyNote')} />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
