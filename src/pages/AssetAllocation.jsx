import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Plus, AlertTriangle, Filter, ArrowLeftRight } from 'lucide-react';
import toast from 'react-hot-toast';
import AllocationCard from '../components/allocation/AllocationCard';
import TransferDialog from '../components/allocation/TransferDialog';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import SearchBar from '../components/common/SearchBar';
import StatusBadge from '../components/common/StatusBadge';
import DataTable from '../components/common/DataTable';
import { mockAllocations, mockAssets, mockEmployees } from '../utils/mockData';
import { formatDate } from '../utils/helpers';

// POST /api/allocations          { assetId, employeeId, expectedReturn?, notes? }
// POST /api/allocations/:id/transfer { newEmployeeId, reason, notes }
// POST /api/allocations/:id/return   { condition, notes, returnedDate }
// GET  /api/allocations/conflicts    { assetId, startDate, endDate }
// GET  /api/allocations/overdue

export default function AssetAllocation() {
  const [allocations, setAllocations] = useState(mockAllocations);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('Active');
  const [allocateOpen, setAllocateOpen] = useState(false);
  const [returnTarget, setReturnTarget] = useState(null);
  const [transferTarget, setTransferTarget] = useState(null);
  const [conflictWarning, setConflictWarning] = useState(false);
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(() => allocations.filter((a) => {
    const q = search.toLowerCase();
    const matchSearch = !q || a.assetName.toLowerCase().includes(q) || a.employeeName?.toLowerCase().includes(q);
    const matchStatus = !filterStatus || a.status === filterStatus;
    return matchSearch && matchStatus;
  }), [allocations, search, filterStatus]);

  const handleAllocate = async (data) => {
    // TODO: check conflict → GET /api/allocations/conflicts?assetId=&...
    const asset = mockAssets.find((a) => a.id === data.assetId);
    if (asset?.status === 'Allocated') {
      setConflictWarning(true);
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    // TODO: const { data: alc } = await allocateAsset(data);
    const employee = mockEmployees.find((e) => e.id === data.employeeId);
    setAllocations((prev) => [...prev, {
      id: `alc-${Date.now()}`,
      assetId: data.assetId, assetName: asset?.name || 'Unknown', assetTag: asset?.tag || '',
      employeeId: data.employeeId, employeeName: employee?.name || 'Unknown',
      department: employee?.department || '',
      allocatedDate: new Date().toISOString(), expectedReturn: data.expectedReturn || null,
      returnedDate: null, allocatedBy: 'You', status: 'Active', notes: data.notes,
    }]);
    toast.success('Asset allocated successfully');
    setLoading(false);
    setAllocateOpen(false);
  };

  const handleReturn = async (data) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    // TODO: await returnAsset(returnTarget.id, data);
    setAllocations((prev) => prev.map((a) => a.id === returnTarget.id
      ? { ...a, status: 'Returned', returnedDate: new Date().toISOString() } : a));
    toast.success('Asset returned successfully');
    setLoading(false);
    setReturnTarget(null);
  };

  const handleTransfer = async (data) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    // TODO: await transferAsset(transferTarget.id, data);
    const employee = mockEmployees.find((e) => e.id === data.newEmployeeId);
    setAllocations((prev) => prev.map((a) => a.id === transferTarget.id
      ? { ...a, employeeId: data.newEmployeeId, employeeName: employee?.name || 'Unknown', department: employee?.department || '' }
      : a));
    toast.success('Asset transferred successfully');
    setLoading(false);
    setTransferTarget(null);
  };

  const availableAssets = mockAssets.filter((a) => a.status === 'Available');

  const columns = [
    {
      header: 'Asset',
      accessorKey: 'assetName',
      cell: ({ row }) => (
        <div>
          <p className="font-semibold text-xs text-text-primary">{row.original.assetName}</p>
          <p className="text-xs text-text-muted font-mono">{row.original.assetTag}</p>
        </div>
      ),
    },
    { header: 'Assigned To', accessorKey: 'employeeName', cell: ({ getValue }) => <span className="text-xs">{getValue()}</span> },
    { header: 'Department', accessorKey: 'department', cell: ({ getValue }) => <span className="text-xs text-text-secondary">{getValue()}</span> },
    { header: 'Allocated', accessorKey: 'allocatedDate', cell: ({ getValue }) => <span className="text-xs">{formatDate(getValue())}</span> },
    {
      header: 'Return Due',
      accessorKey: 'expectedReturn',
      cell: ({ row }) => {
        const overdue = row.original.expectedReturn && new Date(row.original.expectedReturn) < new Date() && row.original.status === 'Active';
        return <span className={`text-xs font-medium ${overdue ? 'text-status-lost' : 'text-text-secondary'}`}>{row.original.expectedReturn ? formatDate(row.original.expectedReturn) : '—'}</span>;
      },
    },
    { header: 'Status', accessorKey: 'status', cell: ({ getValue }) => <StatusBadge status={getValue() === 'Active' ? 'Allocated' : 'Available'} size="sm" /> },
    {
      header: 'Actions',
      id: 'actions',
      cell: ({ row }) => row.original.status === 'Active' ? (
        <div className="flex gap-1">
          <button onClick={() => setTransferTarget(row.original)} className="text-xs text-primary hover:underline font-medium px-2 py-1 rounded hover:bg-background transition-colors">Transfer</button>
          <button onClick={() => setReturnTarget(row.original)} className="text-xs text-status-available hover:underline font-medium px-2 py-1 rounded hover:bg-background transition-colors">Return</button>
        </div>
      ) : <span className="text-xs text-text-muted">Returned</span>,
    },
  ];

  return (
    <div className="af-page max-w-screen-xl mx-auto">
      {/* Header */}
      <div className="af-page-header">
        <div>
          <h1 className="af-page-title">Asset Allocation</h1>
          <p className="af-page-subtitle">Manage asset assignments, transfers, and returns</p>
        </div>
        <Button variant="primary" icon={<Plus size={15} />} onClick={() => setAllocateOpen(true)}>
          Allocate Asset
        </Button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Active Allocations', value: allocations.filter((a) => a.status === 'Active').length, color: '#5E244E' },
          { label: 'Returned', value: allocations.filter((a) => a.status === 'Returned').length, color: '#4CAF50' },
          { label: 'Overdue Returns', value: allocations.filter((a) => a.expectedReturn && new Date(a.expectedReturn) < new Date() && a.status === 'Active').length, color: '#C0392B' },
          { label: 'Available Assets', value: availableAssets.length, color: '#1976D2' },
        ].map((stat) => (
          <div key={stat.label} className="bg-surface rounded-card border border-border p-4">
            <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-xs text-text-secondary mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <SearchBar value={search} onChange={setSearch} placeholder="Search assets, employees…" className="sm:w-72" />
        <div className="flex gap-2 sm:ml-auto">
          {['Active', 'Returned', ''].map((s) => (
            <button
              key={s || 'all'}
              onClick={() => setFilterStatus(s)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-all ${filterStatus === s ? 'bg-primary text-white border-primary' : 'bg-surface border-border text-text-secondary hover:border-primary/40'}`}
            >
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Conflict Warning Banner */}
      {conflictWarning && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-4 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-card">
          <AlertTriangle size={16} className="text-status-lost flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-status-lost">Allocation Conflict Detected</p>
            <p className="text-xs text-red-600 mt-0.5">This asset is already allocated. Please choose an available asset or return the current allocation first.</p>
          </div>
          <button onClick={() => setConflictWarning(false)} className="text-red-400 hover:text-red-600">✕</button>
        </motion.div>
      )}

      {/* Table */}
      <DataTable columns={columns} data={filtered} emptyMessage="No allocations found" />

      {/* Allocate Modal */}
      <AllocateModal
        open={allocateOpen}
        onClose={() => setAllocateOpen(false)}
        onSubmit={handleAllocate}
        loading={loading}
        availableAssets={availableAssets}
      />

      {/* Return Modal */}
      <ReturnModal
        open={Boolean(returnTarget)}
        allocation={returnTarget}
        onClose={() => setReturnTarget(null)}
        onConfirm={handleReturn}
        loading={loading}
      />

      {/* Transfer Dialog */}
      <TransferDialog
        open={Boolean(transferTarget)}
        allocation={transferTarget}
        onClose={() => setTransferTarget(null)}
        onConfirm={handleTransfer}
        loading={loading}
      />
    </div>
  );
}

/* ---- Allocate Modal ---- */
function AllocateModal({ open, onClose, onSubmit, loading, availableAssets }) {
  const { register, handleSubmit, formState: { errors } } = useForm();
  return (
    <Modal open={open} onClose={onClose} title="Allocate Asset" size="sm"
      footer={<><Button variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button><Button variant="primary" onClick={handleSubmit(onSubmit)} loading={loading}>Allocate</Button></>}>
      <div className="space-y-4">
        <div>
          <label className="af-label">Select Asset</label>
          <select className="af-select" {...register('assetId', { required: 'Required' })}>
            <option value="">Choose available asset…</option>
            {availableAssets.map((a) => <option key={a.id} value={a.id}>{a.name} ({a.tag})</option>)}
          </select>
          {errors.assetId && <p className="mt-1 text-xs text-status-lost">{errors.assetId.message}</p>}
        </div>
        <div>
          <label className="af-label">Assign To Employee</label>
          <select className="af-select" {...register('employeeId', { required: 'Required' })}>
            <option value="">Choose employee…</option>
            {mockEmployees.map((e) => <option key={e.id} value={e.id}>{e.name} — {e.department}</option>)}
          </select>
          {errors.employeeId && <p className="mt-1 text-xs text-status-lost">{errors.employeeId.message}</p>}
        </div>
        <Input label="Expected Return Date (optional)" type="date" {...register('expectedReturn')} />
        <div>
          <label className="af-label">Notes (optional)</label>
          <textarea className="af-input resize-none" rows={2} {...register('notes')} />
        </div>
      </div>
    </Modal>
  );
}

/* ---- Return Modal ---- */
function ReturnModal({ open, allocation, onClose, onConfirm, loading }) {
  const { register, handleSubmit } = useForm({ defaultValues: { returnedDate: new Date().toISOString().split('T')[0] } });
  if (!allocation) return null;
  return (
    <Modal open={open} onClose={onClose} title="Return Asset" size="sm"
      footer={<><Button variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button><Button variant="accent" onClick={handleSubmit(onConfirm)} loading={loading}>Confirm Return</Button></>}>
      <div className="space-y-4">
        <div className="p-3 bg-background rounded-button">
          <p className="text-xs font-semibold text-text-primary">{allocation.assetName}</p>
          <p className="text-xs text-text-secondary">Returning from {allocation.employeeName}</p>
        </div>
        <div>
          <label className="af-label">Condition on Return</label>
          <select className="af-select" {...register('condition', { required: true })}>
            <option>Excellent</option><option>Good</option><option>Fair</option><option>Poor</option>
          </select>
        </div>
        <Input label="Return Date" type="date" {...register('returnedDate')} />
        <div>
          <label className="af-label">Notes</label>
          <textarea className="af-input resize-none" rows={2} {...register('notes')} />
        </div>
      </div>
    </Modal>
  );
}
