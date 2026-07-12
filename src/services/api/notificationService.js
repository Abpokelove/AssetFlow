import axiosInstance from './axiosInstance';

/**
 * Notification Service
 * ====================
 * API calls for user notifications and activity log.
 *
 * Notification shape:
 * {
 *   id: string,
 *   type: 'maintenance'|'allocation'|'booking'|'audit'|'return'|'system',
 *   title: string, message: string,
 *   timestamp: string (ISO), read: boolean,
 *   priority: 'Low'|'Medium'|'High', link: string|null
 * }
 */

/**
 * GET /api/notifications
 * Query: { page, pageSize, type, read }
 * Returns: { data: Notification[], total: number, unreadCount: number }
 */
export const getNotifications = (params = {}) =>
  axiosInstance.get('/notifications', { params });

/**
 * POST /api/notifications/:id/read
 * Returns: Notification (read = true)
 */
export const markAsRead = (id) =>
  axiosInstance.post(`/notifications/${id}/read`);

/**
 * POST /api/notifications/read-all
 * Returns: { updated: number }
 */
export const markAllAsRead = () =>
  axiosInstance.post('/notifications/read-all');

/**
 * DELETE /api/notifications/:id
 * Returns: 204
 */
export const deleteNotification = (id) =>
  axiosInstance.delete(`/notifications/${id}`);

/**
 * GET /api/notifications/unread-count
 * Returns: { count: number }
 */
export const getUnreadCount = () =>
  axiosInstance.get('/notifications/unread-count');
