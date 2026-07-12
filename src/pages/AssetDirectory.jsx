import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Filter, LayoutGrid, List, X, Download, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import AssetCard from '../components/asset/AssetCard';
import AssetForm from '../components/asset/AssetForm';
import StatusBadge from '../components/common/StatusBadge';
import SearchBar from '../components/common/SearchBar';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import DataTable from '../components/common/DataTable';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { ASSET_STATUS, ASSET_CATEGORIES } from '../utils/constants';
import { formatDate, formatCurrency } from '../utils/helpers';
import { getAssets, createAsset, exportAssets } from '../services/api/assetService';
import { getDepartments } from '../services/api/organizationService';
import { getAssetsByStatus } from '../services/api/reportService';

export default function AssetDirectory() {
  const [assets, setAssets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [modalOpen, setModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const PAGE_SIZE = 10;

  // Filter metadata
  const [departments, setDepartments] = useState([]);
  const [statusCounts, setStatusCounts] = useState({});

  // Fetch departments and status counts on mount
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [deptRes, statusRes] = await Promise.all([
          getDepartments(),
          getAssetsByStatus()
        ]);
        setDepartments(deptRes.data || []);

        const counts = (statusRes.data || []).reduce((acc, curr) => {
          acc[curr.name] = curr.value;
          return acc;
        }, {});
        setStatusCounts(counts);
      } catch (err) {
        console.error('Failed to load filter metadata:', err);
      }
    };
    fetchMetadata();
  }, []);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchTerm);
      setPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch paginated and filtered assets
  const fetchAssets = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAssets({
        page,
        pageSize: PAGE_SIZE,
        status: filterStatus || undefined,
        category: filterCategory || undefined,
        department: filterDepartment || undefined,
        search: search || undefined
      });
      const responseData = res.data || {};
      setAssets(responseData.data || []);
      setTotal(responseData.total || 0);
    } catch (err) {
      console.error('Failed to fetch assets:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load assets from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [page, filterStatus, filterCategory, filterDepartment, search]);

  const handleRegister = async (data) => {
    setFormLoading(true);
    try {
      await createAsset(data);
      toast.success('Asset registered successfully');
      setModalOpen(false);
      fetchAssets();

      // Refresh status counts
      const statusRes = await getAssetsByStatus();
      const counts = (statusRes.data || []).reduce((acc, curr) => {
        acc[curr.name] = curr.value;
        return acc;
      }, {});
      setStatusCounts(counts);
    } catch (err) {
      console.error('Failed to register asset:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to register asset');
    } finally {
      setFormLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      toast.loading('Exporting assets...', { id: 'export-toast' });
      const res = await exportAssets({
        status: filterStatus || undefined,
        category: filterCategory || undefined,
        department: filterDepartment || undefined,
        search: search || undefined,
        format: 'csv'
      });

      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `assets-export-${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

      toast.success('Assets exported successfully', { id: 'export-toast' });
    } catch (err) {
      console.error('Failed to export assets:', err);
      toast.error('Failed to export assets', { id: 'export-toast' });
    }
  };

  const clearFilters = () => {
    setFilterStatus('');
    setFilterCategory('');
    setFilterDepartment('');
    setSearchTerm('');
    setSearch('');
    setPage(1);
  };

  const activeFilters = [filterStatus, filterCategory, filterDepartment].filter(Boolean).length;
  const totalAssetsCount = Object.values(statusCounts).reduce((a, b) => a + b, 0);

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

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="af-page max-w-screen-2xl mx-auto">
      {/* Header */}
      <div className="af-page-header">
        <div>
          <h1 className="af-page-title">Asset Directory</h1>
          <p className="af-page-subtitle">{total} total assets</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" icon={<Download size={15} />} onClick={handleExport} size="sm">Export</Button>
          <Button variant="primary" icon={<Plus size={15} />} onClick={() => setModalOpen(true)}>
            Register Asset
          </Button>
        </div>
      </div>

      {/* Status filter pills */}
      <div className="flex gap-2 flex-wrap mb-5">
        <button
          onClick={() => { setFilterStatus(''); setPage(1); }}
          className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${!filterStatus ? 'bg-primary text-white' : 'bg-surface border border-border text-text-secondary hover:border-primary/40'}`}
        >
          All ({totalAssetsCount})
        </button>
        {Object.entries(statusCounts).filter(([, c]) => c > 0).map(([status, count]) => (
          <button
            key={status}
            onClick={() => { setFilterStatus(status === filterStatus ? '' : status); setPage(1); }}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${filterStatus === status ? 'bg-primary text-white' : 'bg-surface border border-border text-text-secondary hover:border-primary/40'}`}
          >
            {status} ({count})
          </button>
        ))}
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-status-lost/10 border border-status-lost/30 text-status-lost p-4 rounded-card flex items-center gap-3 mb-5">
          <AlertTriangle size={20} className="flex-shrink-0" />
          <div className="flex-1">
            <h4 className="font-semibold text-sm">Failed to Load Assets</h4>
            <p className="text-xs">{error}</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchAssets} className="border-status-lost/30 hover:bg-status-lost/10">
            Retry
          </Button>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Search assets, tags, serials…" className="flex-1 max-w-sm" />

        <div className="flex gap-2 sm:ml-auto">
          {/* Category filter */}
          <select
            className="af-select text-xs w-44"
            value={filterCategory}
            onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
          >
            <option value="">All Categories</option>
            {ASSET_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* Department filter */}
          <select
            className="af-select text-xs w-44"
            value={filterDepartment}
            onChange={(e) => { setFilterDepartment(e.target.value); setPage(1); }}
          >
            <option value="">All Departments</option>
            {departments.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
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

      {/* Loading state for grid */}
      {loading && viewMode === 'grid' && (
        <div className="flex justify-center items-center py-24">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && assets.length === 0 && (
        <div className="text-center py-16 bg-surface border border-border rounded-card">
          <p className="text-text-muted text-sm">No assets match your filters.</p>
          <button onClick={clearFilters} className="mt-2 text-xs text-primary hover:underline">Clear filters</button>
        </div>
      )}

      {/* Grid view */}
      <AnimatePresence mode="wait">
        {viewMode === 'grid' && !loading && !error && assets.length > 0 && (
          <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {assets.map((asset, i) => <AssetCard key={asset.id} asset={asset} index={i} />)}
          </motion.div>
        )}

        {/* Table view */}
        {viewMode === 'table' && !error && assets.length > 0 && (
          <motion.div key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <DataTable
              columns={columns}
              data={assets}
              loading={loading}
              onRowClick={(row) => window.location.assign(`/assets/${row.id}`)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pagination controls */}
      {!loading && !error && totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 px-1 bg-surface border border-border rounded-card p-3">
          <p className="text-xs text-text-muted">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total} assets
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="p-1 rounded disabled:opacity-30 hover:bg-background transition-colors text-text-secondary disabled:cursor-not-allowed"
            >
              <ChevronsLeft size={16} />
            </button>
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="p-1 rounded disabled:opacity-30 hover:bg-background transition-colors text-text-secondary disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs text-text-secondary px-2 font-medium">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className="p-1 rounded disabled:opacity-30 hover:bg-background transition-colors text-text-secondary disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className="p-1 rounded disabled:opacity-30 hover:bg-background transition-colors text-text-secondary disabled:cursor-not-allowed"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Register Asset Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Register New Asset" size="lg">
        <AssetForm onSubmit={handleRegister} onCancel={() => setModalOpen(false)} loading={formLoading} />
      </Modal>
    </div>
  );
}

