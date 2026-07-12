import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Pencil, QrCode, Clock, MapPin, Tag,
  Calendar, DollarSign, User, Wrench, Package, Shield,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { mockAssets } from '../utils/mockData';
import AssetStatusTimeline from '../components/asset/AssetStatusTimeline';
import AssetForm from '../components/asset/AssetForm';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { formatDate, formatCurrency } from '../utils/helpers';

// GET /api/assets/:id  → Asset (full with timeline)
// PUT /api/assets/:id  → update
// GET /api/assets/:id/timeline  → AssetTimelineEntry[]

export default function AssetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const [assets, setAssets] = useState(mockAssets);

  const asset = assets.find((a) => a.id === id);

  if (!asset) {
    return (
      <div className="af-page text-center py-16">
        <p className="text-text-muted">Asset not found.</p>
        <Button variant="ghost" onClick={() => navigate('/assets')} className="mt-4" icon={<ArrowLeft size={15} />}>
          Back to Assets
        </Button>
      </div>
    );
  }

  const handleUpdate = async (data) => {
    // TODO: await updateAsset(asset.id, data);
    setAssets((prev) => prev.map((a) => a.id === id ? { ...a, ...data } : a));
    toast.success('Asset updated');
    setEditOpen(false);
  };

  const DetailRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-lg bg-background flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon size={13} className="text-text-muted" />
      </div>
      <div>
        <p className="text-xs text-text-muted">{label}</p>
        <p className="text-sm font-medium text-text-primary">{value || '—'}</p>
      </div>
    </div>
  );

  return (
    <div className="af-page max-w-screen-xl mx-auto">
      {/* Back + header */}
      <div className="flex items-start gap-4 mb-6">
        <button onClick={() => navigate('/assets')} className="mt-1 p-2 rounded-button hover:bg-border transition-colors text-text-secondary">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-text-primary">{asset.name}</h1>
            <StatusBadge status={asset.status} />
          </div>
          <p className="text-sm text-text-muted font-mono mt-1">{asset.tag}</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button variant="outline" icon={<QrCode size={15} />} size="sm">QR Code</Button>
          <Button variant="primary" icon={<Pencil size={15} />} size="sm" onClick={() => setEditOpen(true)}>Edit</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main details */}
        <div className="lg:col-span-2 space-y-5">
          {/* Core Info */}
          <Card padding="p-5">
            <h2 className="text-sm font-bold text-text-primary mb-4">Asset Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DetailRow icon={Tag} label="Category" value={asset.category} />
              <DetailRow icon={Package} label="Condition" value={asset.condition} />
              <DetailRow icon={MapPin} label="Location" value={asset.location} />
              <DetailRow icon={Shield} label="Serial Number" value={asset.serialNumber} />
              <DetailRow icon={Calendar} label="Purchase Date" value={formatDate(asset.purchaseDate)} />
              <DetailRow icon={Calendar} label="Warranty Expiry" value={formatDate(asset.warrantyExpiry)} />
              <DetailRow icon={DollarSign} label="Purchase Value" value={formatCurrency(asset.purchaseValue)} />
              <DetailRow icon={DollarSign} label="Current Value" value={formatCurrency(asset.currentValue)} />
              <DetailRow icon={Calendar} label="Registered" value={formatDate(asset.registeredDate)} />
              <DetailRow icon={Calendar} label="Last Audit" value={formatDate(asset.lastAuditDate)} />
            </div>
            {asset.description && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-text-muted mb-1">Description</p>
                <p className="text-sm text-text-secondary">{asset.description}</p>
              </div>
            )}
          </Card>

          {/* Assignment */}
          <Card padding="p-5">
            <h2 className="text-sm font-bold text-text-primary mb-4">Current Assignment</h2>
            {asset.assignedTo ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
                  {asset.assignedTo.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">{asset.assignedTo}</p>
                  <p className="text-xs text-text-secondary">{asset.department}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-text-muted">
                <User size={18} />
                <p className="text-sm">Not currently assigned</p>
              </div>
            )}
          </Card>

          {/* QR Code Placeholder */}
          <Card padding="p-5">
            <h2 className="text-sm font-bold text-text-primary mb-4">QR Code</h2>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 bg-background border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-1">
                <QrCode size={28} className="text-text-muted" />
                <p className="text-[10px] text-text-muted text-center">QR Preview</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">{asset.tag}</p>
                <p className="text-xs text-text-secondary mt-1">
                  Scan to view asset details or update status.
                </p>
                <p className="text-xs text-text-muted mt-1">
                  Backend: GET /api/assets/{asset.id}/qr
                </p>
                <Button variant="outline" size="sm" icon={<QrCode size={13} />} className="mt-2">
                  Download QR
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Timeline sidebar */}
        <div>
          <Card padding="p-5">
            <div className="flex items-center gap-2 mb-5">
              <Clock size={15} className="text-primary" />
              <h2 className="text-sm font-bold text-text-primary">Status Timeline</h2>
            </div>
            <AssetStatusTimeline timeline={asset.timeline || []} />
          </Card>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Asset" size="lg">
        <AssetForm defaultValues={asset} onSubmit={handleUpdate} onCancel={() => setEditOpen(false)} />
      </Modal>
    </div>
  );
}
