import axiosInstance from './axiosInstance';

/**
 * Maintenance Service
 * ===================
 * API calls for Maintenance workflow (request → approve → schedule → complete).
 *
 * Maintenance shape:
 * {
 *   id: string, assetId: string, assetName: string, assetTag: string,
 *   type: 'Corrective'|'Preventive'|'Inspection',
 *   priority: 'Low'|'Medium'|'High'|'Critical',
 *   status: 'Requested'|'Approved'|'Scheduled'|'In Progress'|'Completed'|'Rejected',
 *   requestedBy: string, requestedDate: string (ISO),
 *   approvedBy: string|null, approvedDate: string|null (ISO),
 *   vendor: string|null, scheduledDate: string|null (ISO),
 *   completedDate: string|null (ISO), estimatedCost: number,
 *   description: string, notes: string,
 *   steps: MaintenanceStep[]
 * }
 * MaintenanceStep: { label: string, completed: boolean, date: string|null }
 */

/**
 * GET /api/maintenance
 * Query: { page, pageSize, status, priority, assetId, search }
 * Returns: { data: Maintenance[], total: number }
 */
export const getMaintenanceRequests = (params = {}) =>
  axiosInstance.get('/maintenance', { params });

/**
 * GET /api/maintenance/:id
 * Returns: Maintenance
 */
export const getMaintenanceById = (id) =>
  axiosInstance.get(`/maintenance/${id}`);

/**
 * POST /api/maintenance
 * Body: { assetId, type, priority, description, notes? }
 * Returns: Maintenance (status = 'Requested')
 * Side effect: asset status → 'Pending Approval'
 */
export const requestMaintenance = (data) =>
  axiosInstance.post('/maintenance', data);

/**
 * POST /api/maintenance/:id/approve
 * Body: { notes? }
 * Returns: Maintenance (status = 'Approved')
 */
export const approveMaintenance = (id, data = {}) =>
  axiosInstance.post(`/maintenance/${id}/approve`, data);

/**
 * POST /api/maintenance/:id/reject
 * Body: { reason: string }
 * Returns: Maintenance (status = 'Rejected')
 * Side effect: asset status reverted
 */
export const rejectMaintenance = (id, data) =>
  axiosInstance.post(`/maintenance/${id}/reject`, data);

/**
 * POST /api/maintenance/:id/schedule
 * Body: { vendor: string, scheduledDate: string (ISO), estimatedCost: number }
 * Returns: Maintenance (status = 'Scheduled')
 * Side effect: asset status → 'Under Maintenance'
 */
export const scheduleMaintenance = (id, data) =>
  axiosInstance.post(`/maintenance/${id}/schedule`, data);

/**
 * POST /api/maintenance/:id/complete
 * Body: { completedDate: string, notes: string, actualCost?: number }
 * Returns: Maintenance (status = 'Completed')
 * Side effect: asset status → 'Available'
 */
export const completeMaintenance = (id, data) =>
  axiosInstance.post(`/maintenance/${id}/complete`, data);

/**
 * GET /api/maintenance/overdue
 * Returns: Maintenance[] (scheduled but not completed past scheduled date)
 */
export const getOverdueMaintenance = () =>
  axiosInstance.get('/maintenance/overdue');
