import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  deleteNotification as deleteNotificationRequest,
  getNotifications,
  markAllAsRead as markAllAsReadRequest,
  markAsRead,
} from '../services/api/notificationService';
import { apiErrorMessage, unwrapPage } from '../services/api/responseUtils';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refreshNotifications = useCallback(async (params = {}) => {
    if (!localStorage.getItem('af_token')) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await getNotifications({ pageSize: 50, ...params });
      const page = unwrapPage(response);
      setNotifications(page.data);
      setUnreadCount(page.unreadCount);
    } catch (err) {
      setError(apiErrorMessage(err, 'Unable to load notifications'));
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleAuthChange = () => refreshNotifications();

    refreshNotifications();
    window.addEventListener('assetflow-auth-changed', handleAuthChange);
    return () => {
      window.removeEventListener('assetflow-auth-changed', handleAuthChange);
    };
  }, [refreshNotifications]);

  const markRead = useCallback(async (id) => {
    await markAsRead(id);
    setNotifications((prev) => prev.map((notification) => (
      notification.id === id ? { ...notification, read: true } : notification
    )));
    setUnreadCount((count) => Math.max(count - 1, 0));
  }, []);

  const markAllRead = useCallback(async () => {
    await markAllAsReadRequest();
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })));
    setUnreadCount(0);
  }, []);

  const deleteNotification = useCallback(async (id) => {
    await deleteNotificationRequest(id);
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  }, []);

  const value = useMemo(() => ({
    notifications,
    unreadCount,
    loading,
    error,
    refreshNotifications,
    markRead,
    markAllRead,
    deleteNotification,
    setNotifications,
  }), [notifications, unreadCount, loading, error, refreshNotifications, markRead, markAllRead, deleteNotification]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
