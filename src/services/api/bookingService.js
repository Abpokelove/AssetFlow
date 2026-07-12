import axiosInstance from './axiosInstance';

/**
 * Booking Service
 * ===============
 * API calls for Resource Booking (calendar-based reservations).
 *
 * Booking shape:
 * {
 *   id: string, assetId: string, assetName: string, assetTag: string,
 *   bookedBy: string, bookedById: string, department: string,
 *   startDate: string (ISO datetime), endDate: string (ISO datetime),
 *   purpose: string,
 *   status: 'Upcoming'|'Ongoing'|'Completed'|'Cancelled',
 *   approvedBy: string|null
 * }
 */

/**
 * GET /api/bookings
 * Query: { page, pageSize, status, assetId, bookedById, from, to }
 * Returns: { data: Booking[], total: number }
 */
export const getBookings = (params = {}) =>
  axiosInstance.get('/bookings', { params });

/**
 * GET /api/bookings/:id
 * Returns: Booking
 */
export const getBookingById = (id) =>
  axiosInstance.get(`/bookings/${id}`);

/**
 * POST /api/bookings
 * Body: { assetId, startDate, endDate, purpose, notes? }
 * Returns: Booking
 */
export const createBooking = (data) =>
  axiosInstance.post('/bookings', data);

/**
 * PUT /api/bookings/:id
 * Body: Partial<Booking>
 * Returns: Booking
 */
export const updateBooking = (id, data) =>
  axiosInstance.put(`/bookings/${id}`, data);

/**
 * POST /api/bookings/:id/cancel
 * Body: { reason: string }
 * Returns: Booking (status = 'Cancelled')
 */
export const cancelBooking = (id, data) =>
  axiosInstance.post(`/bookings/${id}/cancel`, data);

/**
 * GET /api/bookings/availability
 * Query: { assetId, startDate, endDate }
 * Returns: { available: boolean, conflicts: Booking[] }
 * Use this before creating a booking to detect overlaps.
 */
export const checkBookingAvailability = (params) =>
  axiosInstance.get('/bookings/availability', { params });

/**
 * GET /api/bookings/calendar
 * Query: { month, year, assetId? }
 * Returns: Booking[] formatted for React Big Calendar
 */
export const getCalendarBookings = (params) =>
  axiosInstance.get('/bookings/calendar', { params });
