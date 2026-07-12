import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Filter, LayoutGrid, List, X, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import AssetCard from '../components/asset/AssetCard';
import AssetForm from '../components/asset/AssetForm';
import StatusBadge from '../components/common/StatusBadge';
import SearchBar from '../components/common/SearchBar';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import DataTable from '../components/common/DataTable';
import { mockAssets } from '../utils/mockData';
import { ASSET_STATUS, ASSET_CATEGORIES } from '../utils/constants';
import { formatDate, formatCurrency } from '../utils/helpers';

// GET /api/assets?page=&pageSize=&status=&category=&department=&search=
// POST /api/assets  → { tag, name, category, condition, ... }
// GET /api/assets/export?format=csv

export default function AssetDirectory() {
  const [assets, setAssets] = useState(mockAssets);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [showFilters, setShowFilters] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const filtered = useMemo(() => {
    return assets.filter((a) => {
      const q = search.toLowerCase();
      const matchSearch = !q || a.name.toLowerCase().includes(q) || a.tag.toLowerCase().includes(q) || a.serialNumber?.toLowerCase().includes(q) || a.assignedTo?.toLowerCase().includes(q);
      const matchStatus = !filterStatus || a.status === filterStatus;
      const matchCat = !filterCategory || a.category === filterCategory;
      return matchSearch && matchStatus && matchCat;
    });
  }, [assets, search, filterStatus, filterCategory]);

  const handleRegister = async (data) => {
    setFormLoading(true);
    // TODO: const { data: created } = await createAsset(data);
    await new Promise((r) => setTimeout(r, 600));
    setAssets((prev) => [...prev, {
      id: `ast-${Date.now()}`, ...data,
      status: 'Available', registeredDate: new Date().toISOString(),
      timeline: [{ status: 'Registered', date: new Date().toISOString(), note: 'Asset added to inventory', by: 'You' }],
    }]);
    toast.success('Asset registered successfully');
    setFormLoading(false);
    setModalOpen(false);
  };

  const clearFilters = () => { setFilterStatus(''); setFilterCategory(''); setSearch(''); };
  const activeFilters = [filterStatus, filterCategory].filter(Boolean).length;

  const columns = [
    {
      header: 'Asset',
      accessorKey: 'name',
      cell: ({ row }) => (
        <div>
          <p className="font-semibold text-text-primary text-xs">{row.original.name}</p>
          <p className="text-xs text-text-muted font-mono">{row.original.tag}</p>
        </div>
      ),
    },
    { header: 'Category', accessorKey: 'category', cell: ({ getValue }) => <span className="text-xs">{getValue()}</span> },
    { header: 'Status', accessorKey: 'status', cell: ({ getValue }) => <StatusBadge status={getValue()} size="sm" /> },
    { header: 'Location', accessorKey: 'location', cell: ({ getValue }) => <span className="text-xs text-text-secondary">{getValue()}</span> },
    { header: 'Assigned To', accessorKey: 'assignedTo', cell: ({ getValue }) => <span className="text-xs text-text-secondary">{getValue() || '—'}</span> },
    { header: 'Value', accessorKey: 'currentValue', cell: ({ getValue }) => <span className="text-xs font-medium">{formatCurrency(getValue())}</span> },
    { header: 'Purchased', accessorKey: 'purchaseDate', cell: ({ getValue }) => <span className="text-xs text-text-secondary">{formatDate(getValue())}</span> },
  ];

  const statusCounts = Object.values(ASSET_STATUS).reduce((acc, s) => {
    acc[s] = assets.filter((a) => a.status === s).length;
    return acc;
  }, {});

  return (
    <div className="af-page max-w-screen-2xl mx-auto">
      {/* Header */}
      <div className="af-page-header">
        <div>
          <h1 className="af-page-title">Asset Directory</h1>
          <p className="af-page-subtitle">{assets.length} total assets · {filtered.length} shown</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" icon={<Download size={15} />} size="sm">Export</Button>
          <Button variant="primary" icon={<Plus size={15} />} onClick={() => setModalOpen(true)}>
            Register Asset
          </Button>
        </div>
      </div>

      {/* Status filter pills */}
      <div className="flex gap-2 flex-wrap mb-5">
        <button
          onClick={() => setFilterStatus('')}
          className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${!filterStatus ? 'bg-primary text-white' : 'bg-surface border border-border text-text-secondary hover:border-primary/40'}`}
        >
          All ({assets.length})
        </button>
        {Object.entries(statusCounts).filter(([, c]) => c > 0).map(([status, count]) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status === filterStatus ? '' : status)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${filterStatus === status ? 'bg-primary text-white' : 'bg-surface border border-border text-text-secondary hover:border-primary/40'}`}
          >
            {status} ({count})
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <SearchBar value={search} onChange={setSearch} placeholder="Search assets, tags, serials…" className="flex-1 max-w-sm" />

        <div className="flex gap-2 sm:ml-auto">
          {/* Category filter */}
          <select
            className="af-select text-xs w-44"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {ASSET_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          {activeFilters > 0 && (
            <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-status-lost hover:underline">
              <X size={12} /> Clear
            </button>
          )}

          {/* View toggle */}
          <div className="flex border border-border rounded-button overflow-hidden">
            <button onClick={() => setViewMode('grid')} className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-background'}`}>
              <LayoutGrid size={15} />
            </button>
            <button onClick={() => setViewMode('table')} className={`p-2 transition-colors ${viewMode === 'table' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-background'}`}>
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-text-muted text-sm">No assets match your filters.</p>
          <button onClick={clearFilters} className="mt-2 text-xs text-primary hover:underline">Clear filters</button>
        </div>
      )}

      {/* Grid view */}
      <AnimatePresence mode="wait">
        {viewMode === 'grid' && filtered.length > 0 && (
          <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((asset, i) => <AssetCard key={asset.id} asset={asset} index={i} />)}
          </motion.div>
        )}

        {/* Table view */}
        {viewMode === 'table' && filtered.length > 0 && (
          <motion.div key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <DataTable
              columns={columns}
              data={filtered}
              onRowClick={(row) => window.location.assign(`/assets/${row.id}`)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Register Asset Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Register New Asset" size="lg">
        <AssetForm onSubmit={handleRegister} onCancel={() => setModalOpen(false)} loading={formLoading} />
      </Modal>
    </div>
  );
}
