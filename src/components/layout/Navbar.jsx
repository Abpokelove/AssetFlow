import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Bell, Menu, Search, LogOut, UserCircle, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { mockNotifications } from '../../utils/mockData';
import { getInitials, timeAgo } from '../../utils/helpers';

// Breadcrumb path map
const PATH_LABELS = {
  '/': 'Dashboard',
  '/organization': 'Organization Setup',
  '/assets': 'Asset Directory',
  '/allocation': 'Asset Allocation',
  '/bookings': 'Resource Booking',
  '/maintenance': 'Maintenance',
  '/audit': 'Audit',
  '/reports': 'Reports',
  '/notifications': 'Notifications',
  '/profile': 'My Profile',
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const { toggleMobileSidebar } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const pageTitle = PATH_LABELS[location.pathname] || 'AssetFlow';
  const unreadCount = mockNotifications.filter((n) => !n.read).length;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="h-14 bg-surface border-b border-border px-4 flex items-center gap-4 sticky top-0 z-30">
      {/* Mobile menu button */}
      <button
        onClick={toggleMobileSidebar}
        className="md:hidden p-2 rounded-button text-text-secondary hover:bg-background transition-colors"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* Page title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-sm font-semibold text-text-primary truncate hidden sm:block">
          {pageTitle}
        </h1>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <div className="relative">
          <button
            onClick={() => { setShowNotifications((v) => !v); setShowUserMenu(false); }}
            className="relative p-2 rounded-button text-text-secondary hover:bg-background hover:text-primary transition-colors"
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-secondary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification dropdown */}
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                // Responsive positioning: use a fixed panel under the navbar on mobile so it stays visible and doesn't clip, while keeping the existing absolute dropdown on sm+ screens.
                className="fixed left-2 right-2 top-14 z-50 overflow-hidden rounded-card border border-border bg-surface shadow-card-hover box-border sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-80 sm:max-w-sm"
              >
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <span className="text-sm font-semibold text-text-primary">Notifications</span>
                  <Link
                    to="/notifications"
                    onClick={() => setShowNotifications(false)}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    View all
                  </Link>
                </div>
                {/* Responsive height: give the list more room on mobile/tablet before scrolling, while preserving the familiar desktop height. */}
                <div className="max-h-[60vh] overflow-y-auto overflow-x-hidden divide-y divide-border sm:max-h-72">
                  {mockNotifications.slice(0, 4).map((n) => (
                    <div
                      key={n.id}
                      className={`px-4 py-3 transition-colors hover:bg-background ${!n.read ? 'bg-primary/5' : ''}`}
                    >
                      <p className={`text-xs font-medium ${n.read ? 'text-text-primary' : 'text-primary'}`}>
                        {n.title}
                      </p>
                      <p className="mt-0.5 text-xs text-text-secondary line-clamp-2">{n.message}</p>
                      <p className="mt-1 text-[11px] text-text-muted">{timeAgo(n.timestamp)}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => { setShowUserMenu((v) => !v); setShowNotifications(false); }}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-button hover:bg-background transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
              {getInitials(user?.name || 'U')}
            </div>
            <span className="hidden sm:block text-sm font-medium text-text-primary max-w-[120px] truncate">
              {user?.name?.split(' ')[0]}
            </span>
            <ChevronDown size={14} className="text-text-secondary hidden sm:block" />
          </button>

          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-52 bg-surface rounded-card shadow-card-hover border border-border z-50"
              >
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-semibold text-text-primary">{user?.name}</p>
                  <p className="text-xs text-text-secondary">{user?.email}</p>
                  <p className="text-xs text-text-muted mt-0.5">{user?.role}</p>
                </div>
                <div className="py-1">
                  <Link
                    to="/profile"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-secondary hover:bg-background hover:text-text-primary transition-colors"
                  >
                    <UserCircle size={15} />
                    My Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-status-lost hover:bg-background transition-colors"
                  >
                    <LogOut size={15} />
                    Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Dismiss dropdowns on outside click */}
      {(showNotifications || showUserMenu) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => { setShowNotifications(false); setShowUserMenu(false); }}
        />
      )}
    </header>
  );
}
