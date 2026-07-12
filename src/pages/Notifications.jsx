import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCheck, Inbox } from 'lucide-react';
import toast from 'react-hot-toast';
import NotificationItem from '../components/notifications/NotificationItem';
import SearchBar from '../components/common/SearchBar';
import Button from '../components/common/Button';
import { useNotifications } from '../context/NotificationContext';

// GET  /api/notifications?page=&pageSize=&type=&read=
// POST /api/notifications/:id/read
// POST /api/notifications/read-all
// DELETE /api/notifications/:id

const TYPES = ['', 'maintenance', 'allocation', 'booking', 'audit', 'return', 'system'];
const PRIORITY_FILTERS = ['', 'High', 'Medium', 'Low'];

export default function Notifications() {
  const { notifications, unreadCount, loading, error, refreshNotifications, markRead: markNotificationRead, markAllRead: markAllNotificationsRead, deleteNotification: deleteNotificationItem } = useNotifications();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterRead, setFilterRead] = useState(''); // '' | 'unread' | 'read'

  const filtered = useMemo(() => notifications.filter((n) => {
    const q = search.toLowerCase();
    const matchSearch = !q || n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q);
    const matchType = !filterType || n.type === filterType;
    const matchPriority = !filterPriority || n.priority === filterPriority;
    const matchRead = !filterRead || (filterRead === 'unread' ? !n.read : n.read);
    return matchSearch && matchType && matchPriority && matchRead;
  }), [notifications, search, filterType, filterPriority, filterRead]);

  const markRead = async (id) => {
    try {
      await markNotificationRead(id);
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Unable to mark notification as read');
    }
  };

  const markAllRead = async () => {
    try {
      await markAllNotificationsRead();
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Unable to mark notifications as read');
    }
  };

  const deleteNotif = async (id) => {
    try {
      await deleteNotificationItem(id);
      toast.success('Notification dismissed');
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Unable to dismiss notification');
    }
  };

  return (
    <div className="af-page max-w-screen-lg mx-auto">
      {/* Header */}
      <div className="af-page-header">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="af-page-title">Notifications</h1>
            {unreadCount > 0 && (
              <span className="text-xs font-bold text-white bg-secondary px-2 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          <p className="af-page-subtitle">Stay updated on assets, maintenance, and bookings</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" icon={<CheckCheck size={14} />} onClick={markAllRead}>
            Mark all read
          </Button>
        )}
      </div>

      {/* Filters bar */}
      <div className="bg-surface rounded-card border border-border p-4 mb-5 space-y-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search notifications…" />

        <div className="flex flex-wrap gap-2">
          {/* Type filter */}
          <div className="flex gap-1 flex-wrap">
            {TYPES.map((t) => (
              <button key={t || 'all'} onClick={() => setFilterType(t)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-all capitalize ${filterType === t ? 'bg-primary text-white border-primary' : 'bg-background border-border text-text-secondary hover:border-primary/40'}`}>
                {t || 'All Types'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Read/Unread filter */}
          {['', 'unread', 'read'].map((r) => (
            <button key={r || 'all'} onClick={() => setFilterRead(r)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-all ${filterRead === r ? 'bg-primary text-white border-primary' : 'bg-background border-border text-text-secondary hover:border-primary/40'}`}>
              {r === '' ? 'All' : r === 'unread' ? 'Unread' : 'Read'}
            </button>
          ))}

          <div className="w-px bg-border mx-1" />

          {/* Priority filter */}
          {PRIORITY_FILTERS.map((p) => (
            <button key={p || 'all'} onClick={() => setFilterPriority(p)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-all ${filterPriority === p ? 'bg-primary text-white border-primary' : 'bg-background border-border text-text-secondary hover:border-primary/40'}`}>
              {p || 'All Priorities'}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-text-muted mb-3">{filtered.length} notification{filtered.length !== 1 ? 's' : ''}</p>

      {error && (
        <div className="mb-4 flex items-start gap-3 p-4 bg-status-lost/10 border border-status-lost/20 rounded-card">
          <AlertTriangle size={16} className="text-status-lost flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-status-lost">Unable to load notifications</p>
            <p className="text-xs text-status-lost/80 mt-0.5">{error}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refreshNotifications()}>Retry</Button>
        </div>
      )}

      {/* List */}
      <AnimatePresence>
        {loading ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <p className="text-text-muted text-sm">Loading notifications...</p>
          </motion.div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <div className="w-14 h-14 rounded-full bg-background flex items-center justify-center mx-auto mb-3">
              <Inbox size={24} className="text-text-muted" />
            </div>
            <p className="text-text-muted text-sm">No notifications match your filters.</p>
          </motion.div>
        ) : (
          <motion.div className="space-y-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {filtered.map((notification) => (
              <motion.div
                key={notification.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.2 }}
              >
                <NotificationItem
                  notification={notification}
                  onMarkRead={markRead}
                  onDelete={deleteNotif}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
