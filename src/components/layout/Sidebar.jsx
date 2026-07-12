import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Building2, Package, ArrowLeftRight,
  CalendarDays, Wrench, ClipboardList, BarChart3,
  Bell, UserCircle, ChevronLeft, ChevronRight, Boxes,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/helpers';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { label: 'Organization', icon: Building2, path: '/organization' },
  { label: 'Assets', icon: Package, path: '/assets' },
  { label: 'Allocation', icon: ArrowLeftRight, path: '/allocation' },
  { label: 'Bookings', icon: CalendarDays, path: '/bookings' },
  { label: 'Maintenance', icon: Wrench, path: '/maintenance' },
  { label: 'Audit', icon: ClipboardList, path: '/audit' },
  { label: 'Reports', icon: BarChart3, path: '/reports' },
  { label: 'Notifications', icon: Bell, path: '/notifications' },
  { label: 'Profile', icon: UserCircle, path: '/profile' },
];

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, mobileSidebarOpen, closeMobileSidebar } = useTheme();
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const SidebarContent = ({ collapsed }) => (
    <div className="flex flex-col h-full">
      {/* ---- Logo ---- */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
          <Boxes size={18} className="text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <span className="text-white font-bold text-lg tracking-tight whitespace-nowrap">
                AssetFlow
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ---- Navigation ---- */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto scrollbar-hide">
        {NAV_ITEMS.map(({ label, icon: Icon, path }) => {
          const active = isActive(path);
          return (
            <NavLink
              key={path}
              to={path}
              onClick={closeMobileSidebar}
              title={collapsed ? label : undefined}
              className={`sidebar-nav-item ${active ? 'sidebar-nav-active' : 'sidebar-nav-inactive'}`}
            >
              <Icon size={18} className="flex-shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden whitespace-nowrap text-sm"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
              {active && !collapsed && (
                <motion.div
                  layoutId="active-pill"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-accent"
                />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* ---- User Info ---- */}
      <div className="border-t border-white/10 px-3 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-accent/80 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {getInitials(user?.name || 'User')}
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden min-w-0"
              >
                <p className="text-white text-xs font-semibold truncate whitespace-nowrap">
                  {user?.name}
                </p>
                <p className="text-white/50 text-xs truncate whitespace-nowrap">
                  {user?.role}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ---- Desktop Sidebar ---- */}
      <motion.aside
        animate={{ width: sidebarCollapsed ? 64 : 220 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="hidden md:flex flex-col bg-primary h-screen sticky top-0 shadow-sidebar flex-shrink-0 overflow-visible relative"
      >
        <SidebarContent collapsed={sidebarCollapsed} />

        {/* Collapse Toggle */}
        <button
          onClick={toggleSidebar}
          className="absolute top-5 right-3 w-7 h-7 rounded-full bg-primary border-2 border-background
                     flex items-center justify-center text-white hover:bg-primary-hover transition-colors z-20"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed
            ? <ChevronRight size={12} />
            : <ChevronLeft size={12} />
          }
        </button>
      </motion.aside>

      {/* ---- Mobile Drawer ---- */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            {/* Overlay */}
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobileSidebar}
              className="fixed inset-0 bg-black/45 z-40 md:hidden backdrop-blur-[1px]"
            />
            {/* Drawer */}
            <motion.aside
              key="drawer"
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 w-56 bg-primary z-50 md:hidden shadow-sidebar overflow-hidden"
            >
              <SidebarContent collapsed={false} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
