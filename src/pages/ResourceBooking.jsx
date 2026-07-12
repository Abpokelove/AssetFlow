import { useEffect, useMemo, useState } from 'react';
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
import { cancelBooking, checkBookingAvailability, createBooking, getBookings } from '../services/api/bookingService';
import { getAssets } from '../services/api/assetService';
import { apiErrorMessage, unwrapPage } from '../services/api/responseUtils';
import { formatDateTime } from '../utils/helpers';

const localizer = momentLocalizer(moment);
const BOOKINGS_API_MOUNTED = false;

const STATUS_COLORS_CAL = {
  Upcoming: '#5E244E',
  Ongoing: '#AA1C41',
  Completed: '#4CAF50',
  Cancelled: '#9E9E9E',
};

export default function ResourceBooking() {
  const [bookings, setBookings] = useState([]);
  const [assets, setAssets] = useState([]);
  const [view, setView] = useState('calendar');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [overlapWarning, setOverlapWarning] = useState('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingApiAvailable, setBookingApiAvailable] = useState(BOOKINGS_API_MOUNTED);

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm();

  const loadBookingData = async () => {
    setPageLoading(true);
    setError(null);
    try {
      const assetRes = await getAssets({ pageSize: 100 });
      setAssets(unwrapPage(assetRes).data.filter((asset) => ['Available', 'Reserved'].includes(asset.status)));

      if (!BOOKINGS_API_MOUNTED) {
        setBookings([]);
        setBookingApiAvailable(false);
        setError('Booking backend API is not mounted yet. Live booking data will be available after /api/bookings is added.');
        return;
      }

      const bookingRes = await getBookings({ pageSize: 100 });
      setBookings(unwrapPage(bookingRes).data);
      setBookingApiAvailable(true);
    } catch (err) {
      setBookings([]);
      if (err?.response?.status === 404) {
        setBookingApiAvailable(false);
        setError('Booking backend API is not mounted yet. Live booking data will be available after /api/bookings is added.');
      } else {
        setError(apiErrorMessage(err, 'Booking API is not available yet'));
      }
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    loadBookingData();
  }, []);

  const calendarEvents = bookings.map((booking) => ({
    id: booking.id,
    title: `${booking.assetName} - ${booking.bookedBy}`,
    start: new Date(booking.startDate),
    end: new Date(booking.endDate),
    resource: booking,
    color: STATUS_COLORS_CAL[booking.status] || '#5E244E',
  }));

  const filteredBookings = useMemo(() => bookings.filter((booking) => {
    const q = search.toLowerCase();
    const matchSearch = !q || booking.assetName?.toLowerCase().includes(q) || booking.bookedBy?.toLowerCase().includes(q);
    const matchStatus = !filterStatus || booking.status === filterStatus;
    return matchSearch && matchStatus;
  }), [bookings, search, filterStatus]);

  const handleCreate = async (data) => {
    if (!bookingApiAvailable) {
      setOverlapWarning('Booking API is not available yet. Please wait until /api/bookings is mounted in the backend.');
      return;
    }

    setLoading(true);
    setOverlapWarning('');
    try {
      const availabilityRes = await checkBookingAvailability({
        assetId: data.assetId,
        startDate: data.startDate,
        endDate: data.endDate,
      });

      if (availabilityRes.data?.available === false) {
        setOverlapWarning('This resource already has a booking during the selected time window.');
        return;
      }

      await createBooking(data);
      toast.success('Booking created successfully');
      setModalOpen(false);
      reset();
      await loadBookingData();
    } catch (err) {
      setOverlapWarning(apiErrorMessage(err, 'Unable to create booking. The booking API may not be available yet.'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!bookingApiAvailable) {
      toast.error('Booking API is not available yet.');
      return;
    }

    setLoading(true);
    try {
      await cancelBooking(bookingId, { reason: 'User cancelled' });
      toast.success('Booking cancelled');
      setSelectedBooking(null);
      await loadBookingData();
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Unable to cancel booking'));
    } finally {
      setLoading(false);
    }
  };

  const bookingsByStatus = ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'].reduce((acc, status) => {
    acc[status] = bookings.filter((booking) => booking.status === status).length;
    return acc;
  }, {});

  return (
    <div className="af-page max-w-screen-xl mx-auto">
      <div className="af-page-header">
        <div>
          <h1 className="af-page-title">Resource Booking</h1>
          <p className="af-page-subtitle">Reserve shared assets and manage booking calendar</p>
        </div>
        <Button variant="primary" icon={<Plus size={15} />} onClick={() => setModalOpen(true)} disabled={!bookingApiAvailable || pageLoading}>
          New Booking
        </Button>
      </div>

      {error && (
        <div className="mb-5 flex items-start gap-3 p-4 bg-status-lost/10 border border-status-lost/20 rounded-card">
          <AlertTriangle size={16} className="text-status-lost flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-status-lost">Unable to load bookings</p>
            <p className="text-xs text-status-lost/80 mt-0.5">{error}</p>
          </div>
          <Button variant="outline" size="sm" onClick={loadBookingData}>Retry</Button>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {Object.entries(bookingsByStatus).map(([status, count]) => (
          <div key={status} className="bg-surface rounded-card border border-border p-4">
            <p className="text-2xl font-bold" style={{ color: STATUS_COLORS_CAL[status] }}>{count}</p>
            <p className="text-xs text-text-secondary mt-0.5">{status}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 mb-5 sm:flex-row sm:items-center">
        <div className="flex border border-border rounded-button overflow-hidden self-start">
          <button onClick={() => setView('calendar')} className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors ${view === 'calendar' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-background'}`}>
            <CalendarDays size={13} />Calendar
          </button>
          <button onClick={() => setView('list')} className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors ${view === 'list' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-background'}`}>
            <LayoutList size={13} />List
          </button>
        </div>
        {view === 'list' && (
          <>
            <SearchBar value={search} onChange={setSearch} placeholder="Search bookings..." className="w-full sm:w-64" />
            <div className="flex flex-wrap gap-2 sm:ml-auto">
              {['', 'Upcoming', 'Ongoing', 'Completed', 'Cancelled'].map((status) => (
                <button key={status || 'all'} onClick={() => setFilterStatus(status)}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-all ${filterStatus === status ? 'bg-primary text-white border-primary' : 'bg-surface border-border text-text-secondary hover:border-primary/40'}`}>
                  {status || 'All'}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <AnimatePresence mode="wait">
        {view === 'calendar' && (
          <motion.div key="calendar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="bg-surface rounded-card border border-border p-5 overflow-x-auto">
              <div style={{ minWidth: 600 }}>
                {pageLoading ? (
                  <p className="text-sm text-text-muted py-16 text-center">Loading bookings...</p>
                ) : (
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
                    onSelectSlot={() => {
                      if (bookingApiAvailable) setModalOpen(true);
                    }}
                    selectable={bookingApiAvailable}
                    popup
                  />
                )}
              </div>
            </div>
          </motion.div>
        )}

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
                        <p>{booking.bookedBy} - {booking.department}</p>
                        <p>{formatDateTime(booking.startDate)} to {formatDateTime(booking.endDate)}</p>
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
                <Button variant="danger" onClick={() => handleCancel(selectedBooking.id)} loading={loading}>Cancel Booking</Button>
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
              ].map(([key, value]) => (
                <div key={key} className="flex justify-between gap-4">
                  <span className="text-xs text-text-muted">{key}</span>
                  <span className="text-xs font-medium text-text-primary text-right">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}

      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); reset(); setOverlapWarning(''); }}
        title="New Booking"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => { setModalOpen(false); reset(); setOverlapWarning(''); }} disabled={loading}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmit(handleCreate)} loading={loading} disabled={!bookingApiAvailable}>Create Booking</Button>
          </>
        }
      >
        <div className="space-y-4">
          {overlapWarning && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-button">
              <AlertTriangle size={14} className="text-status-lost flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-status-lost">Booking unavailable</p>
                <p className="text-xs text-red-600">{overlapWarning}</p>
              </div>
              <button onClick={() => setOverlapWarning('')} className="text-red-400 ml-auto"><X size={12} /></button>
            </div>
          )}

          <div>
            <label className="af-label">Asset to Book</label>
            <select className="af-select" {...register('assetId', { required: 'Required' })}>
              <option value="">Select asset...</option>
              {assets.map((asset) => (
                <option key={asset.id} value={asset.id}>{asset.name} ({asset.tag})</option>
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
                validate: (value) => !watch('startDate') || value > watch('startDate') || 'Must be after start',
              })} />
          </div>

          <Input label="Purpose" placeholder="e.g. Client meeting, site visit..." error={errors.purpose?.message}
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
