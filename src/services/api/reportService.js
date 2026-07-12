import axiosInstance from './axiosInstance';

/**
 * Report Service
 * ==============
 * API calls for dashboard analytics and reports.
 */

/**
 * GET /api/reports/summary
 * Returns: {
 *   totalAssets, availableAssets, allocatedAssets, underMaintenance,
 *   pendingApprovals, overdueReturns, activeBookings, upcomingAudits
 * }
 */
export const getDashboardSummary = () =>
  axiosInstance.get('/reports/summary');

/**
 * GET /api/reports/assets-by-category
 * Returns: { name: string, value: number }[]
 */
export const getAssetsByCategory = () =>
  axiosInstance.get('/reports/assets-by-category');

/**
 * GET /api/reports/assets-by-status
 * Returns: { name: string, value: number, color: string }[]
 */
export const getAssetsByStatus = () =>
  axiosInstance.get('/reports/assets-by-status');

/**
 * GET /api/reports/monthly-activity
 * Query: { months?: number } (default 7)
 * Returns: { month: string, allocations: number, returns: number, maintenance: number }[]
 */
export const getMonthlyActivity = (params = {}) =>
  axiosInstance.get('/reports/monthly-activity', { params });

/**
 * GET /api/reports/department-utilization
 * Returns: { dept: string, utilization: number }[]
 */
export const getDepartmentUtilization = () =>
  axiosInstance.get('/reports/department-utilization');

/**
 * GET /api/reports/depreciation
 * Query: { year?: number }
 * Returns: { month: string, value: number }[]
 */
export const getDepreciationReport = (params = {}) =>
  axiosInstance.get('/reports/depreciation', { params });

/**
 * GET /api/reports/export
 * Query: { type: 'assets'|'allocations'|'maintenance'|'audit', format: 'csv'|'xlsx' }
 * Returns: Blob
 */
export const exportReport = (params) =>
  axiosInstance.get('/reports/export', { params, responseType: 'blob' });
