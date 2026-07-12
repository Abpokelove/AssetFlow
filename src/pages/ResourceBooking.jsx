import { useState, useMemo } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, CalendarDays, AlertTriangle, X, LayoutList } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import StatusBadge from '../components/common/StatusBadge';
import SearchBar from '../components/common/SearchBar';
import { mockBookings, mockAssets } from '../utils/mockData';
import { formatDate, formatDateTime } from '../utils/helpers';

// POST /api/bookings      { assetId, startDate, endDate, purpose, notes }
// PUT  /api/bookings/:id
// POST /api/bookings/:id/cancel  { reason }
// GET  /api/bookings/availability { assetId, startDate, endDate }
// GET  /api/bookings/calendar     { month, year }

const localizer = momentLocalizer(moment);

const STATUS_COLORS_CAL = {
  Upcoming: '#5E244E',
  Ongoing: '#AA1C41',
  Completed: '#4CAF50',
  Cancelled: '#9E9E9E',
};

export default function ResourceBooking() {
  const [bookings, setBookings] = useState(mockBookings);
  const [view, setView] = useState('calendar'); // 'calendar' | 'list'
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [overlapWarning, setOverlapWarning] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm();

  // Convert bookings to calendar events
  const calendarEvents = bookings.map((b) => ({
    id: b.id,
    title: `${b.assetName} — ${b.bookedBy}`,
    start: new Date(b.startDate),
    end: new Date(b.endDate),
    resource: b,
    color: STATUS_COLORS_CAL[b.status] || '#5E244E',
  }));

  const filteredBookings = useMemo(() => bookings.filter((b) => {
    const q = search.toLowerCase();
    const matchSearch = !q || b.assetName.toLowerCase().includes(q) || b.bookedBy.toLowerCase().includes(q);
    const matchStatus = !filterStatus || b.status === filterStatus;
    return matchSearch && matchStatus;
  }), [bookings, search, filterStatus]);

  const handleCreate = async (data) => {
    // Overlap check (client-side preview)
    // TODO: GET /api/bookings/availability?assetId=&startDate=&endDate=
    const hasOverlap = bookings.some((b) =>
      b.assetId === data.assetId &&
      b.status !== 'Cancelled' &&
      new Date(data.startDate) < new Date(b.endDate) &&
      new Date(data.endDate) > new Date(b.startDate)
    );
    if (hasOverlap) { setOverlapWarning(true); return; }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    // TODO: const { data: booking } = await createBooking(data);
    const asset = mockAssets.find((a) => a.id === data.assetId);
    setBookings((prev) => [...prev, {
      id: `bkg-${Date.now()}`,
      assetId: data.assetId, assetName: asset?.name || 'Unknown', assetTag: asset?.tag || '',
      bookedBy: 'You', bookedById: 'emp-001', department: 'IT Operations',
      startDate: data.startDate, endDate: data.endDate,
      purpose: data.purpose, status: 'Upcoming', approvedBy: null,
    }]);
    toast.success('Booking created successfully');
    setLoading(false);
    setModalOpen(false);
    reset();
    setOverlapWarning(false);
  };

  const handleCancel = async (bookingId) => {
    // TODO: await cancelBooking(bookingId, { reason: 'User cancelled' });
    setBookings((prev) => prev.map((b) => b.id === bookingId ? { ...b, status: 'Cancelled' } : b));
    toast.success('Booking cancelled');
    setSelectedBooking(null);
  };

  const bookingsByStatus = ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'].reduce((acc, s) => {
    acc[s] = bookings.filter((b) => b.status === s).length;
    return acc;
  }, {});

  return (
    <div className="af-page max-w-screen-xl mx-auto">
      {/* Header */}
      <div className="af-page-header">
        <div>
          <h1 className="af-page-title">Resource Booking</h1>
          <p className="af-page-subtitle">Reserve shared assets and manage booking calendar</p>
        </div>
        <Button variant="primary" icon={<Plus size={15} />} onClick={() => setModalOpen(true)}>
          New Booking
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {Object.entries(bookingsByStatus).map(([status, count]) => (
          <div key={status} className="bg-surface rounded-card border border-border p-4">
            <p className="text-2xl font-bold" style={{ color: STATUS_COLORS_CAL[status] }}>{count}</p>
            <p className="text-xs text-text-secondary mt-0.5">{status}</p>
          </div>
        ))}
      </div>

      {/* View toggle */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex border border-border rounded-button overflow-hidden">
          <button onClick={() => setView('calendar')} className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors ${view === 'calendar' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-background'}`}>
            <CalendarDays size={13} />Calendar
          </button>
          <button onClick={() => setView('list')} className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors ${view === 'list' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-background'}`}>
            <LayoutList size={13} />List
          </button>
        </div>
        {view === 'list' && (
          <>
            <SearchBar value={search} onChange={setSearch} placeholder="Search bookings…" className="w-64" />
            <div className="flex gap-2 ml-auto">
              {['', 'Upcoming', 'Ongoing', 'Completed', 'Cancelled'].map((s) => (
                <button key={s || 'all'} onClick={() => setFilterStatus(s)}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-all hidden sm:block ${filterStatus === s ? 'bg-primary text-white border-primary' : 'bg-surface border-border text-text-secondary hover:border-primary/40'}`}>
                  {s || 'All'}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <AnimatePresence mode="wait">
        {/* Calendar View */}
        {view === 'calendar' && (
          <motion.div key="calendar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="bg-surface rounded-card border border-border p-5 overflow-x-auto">
              <div style={{ minWidth: 600 }}>
                <Calendar
                  localizer={localizer}
                  events={calendarEvents}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: 520 }}
                  views={['month', 'week', 'day']}
                  defaultView="month"
                  eventPropGetter={(event) => ({
                    style: { backgroundColor: event.color, borderRadius: 6, border: 'none', fontSize: 12, fontWeight: 500 },
                  })}
                  onSelectEvent={(event) => setSelectedBooking(event.resource)}
                  onSelectSlot={() => setModalOpen(true)}
                  selectable
                  popup
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* List View */}
        {view === 'list' && (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="space-y-3">
              {filteredBookings.length === 0 ? (
                <p className="text-center py-10 text-sm text-text-muted">No bookings found.</p>
              ) : (
                filteredBookings.map((booking) => (
                  <div key={booking.id} onClick={() => setSelectedBooking(booking)}
                    className="bg-surface rounded-card border border-border p-4 cursor-pointer hover:shadow-card-hover transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-bold text-text-primary">{booking.assetName}</p>
                          <StatusBadge status={booking.status} size="sm" />
                        </div>
                        <p className="text-xs text-text-muted font-mono">{booking.assetTag}</p>
                      </div>
                      <div className="text-xs text-text-secondary space-y-0.5 sm:text-right">
                        <p>{booking.bookedBy} · {booking.department}</p>
                        <p>{formatDateTime(booking.startDate)} → {formatDateTime(booking.endDate)}</p>
                        <p className="text-text-muted">{booking.purpose}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <Modal
          open={Boolean(selectedBooking)}
          onClose={() => setSelectedBooking(null)}
          title="Booking Details"
          size="sm"
          footer={
            <>
              <Button variant="ghost" onClick={() => setSelectedBooking(null)}>Close</Button>
              {selectedBooking.status === 'Upcoming' && (
                <Button variant="danger" onClick={() => handleCancel(selectedBooking.id)}>Cancel Booking</Button>
              )}
            </>
          }
        >
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <p className="text-base font-bold text-text-primary">{selectedBooking.assetName}</p>
              <StatusBadge status={selectedBooking.status} size="sm" />
            </div>
            <p className="text-xs text-text-muted font-mono">{selectedBooking.assetTag}</p>
            <div className="space-y-2 pt-2">
              {[
                ['Booked By', selectedBooking.bookedBy],
                ['Department', selectedBooking.department],
                ['Purpose', selectedBooking.purpose],
                ['Start', formatDateTime(selectedBooking.startDate)],
                ['End', formatDateTime(selectedBooking.endDate)],
                ['Approved By', selectedBooking.approvedBy || 'Pending'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <span className="text-xs text-text-muted">{k}</span>
                  <span className="text-xs font-medium text-text-primary text-right">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {/* New Booking Modal */}
      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); reset(); setOverlapWarning(false); }}
        title="New Booking"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => { setModalOpen(false); reset(); setOverlapWarning(false); }} disabled={loading}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmit(handleCreate)} loading={loading}>Create Booking</Button>
          </>
        }
      >
        <div className="space-y-4">
          {overlapWarning && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-button">
              <AlertTriangle size={14} className="text-status-lost flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-status-lost">Booking Overlap</p>
                <p className="text-xs text-red-600">This asset is already booked for the selected period. Choose a different time or asset.</p>
              </div>
              <button onClick={() => setOverlapWarning(false)} className="text-red-400 ml-auto"><X size={12} /></button>
            </div>
          )}

          <div>
            <label className="af-label">Asset to Book</label>
            <select className="af-select" {...register('assetId', { required: 'Required' })}>
              <option value="">Select asset…</option>
              {mockAssets.filter((a) => ['Available', 'Reserved'].includes(a.status)).map((a) => (
                <option key={a.id} value={a.id}>{a.name} ({a.tag})</option>
              ))}
            </select>
            {errors.assetId && <p className="mt-1 text-xs text-status-lost">{errors.assetId.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Start Date & Time" type="datetime-local" error={errors.startDate?.message}
              {...register('startDate', { required: 'Required' })} />
            <Input label="End Date & Time" type="datetime-local" error={errors.endDate?.message}
              {...register('endDate', {
                required: 'Required',
                validate: (v) => !watch('startDate') || v > watch('startDate') || 'Must be after start',
              })} />
          </div>

          <Input label="Purpose" placeholder="e.g. Client meeting, site visit…" error={errors.purpose?.message}
            {...register('purpose', { required: 'Required' })} />

          <div>
            <label className="af-label">Notes (optional)</label>
            <textarea className="af-input resize-none" rows={2} {...register('notes')} />
          </div>
        </div>
      </Modal>
    </div>
  );
}
