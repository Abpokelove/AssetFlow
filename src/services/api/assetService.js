import axiosInstance from './axiosInstance';

/**
 * Asset Service
 * =============
 * All API calls related to Asset management.
 * Backend team: implement these endpoints on your server.
 */

/**
 * GET /api/assets
 * Query params: { page, pageSize, status, category, department, search }
 * Returns: { data: Asset[], total: number, page: number, pageSize: number }
 *
 * Asset shape:
 * {
 *   id: string, tag: string, name: string, category: string,
 *   status: 'Available'|'Allocated'|'Reserved'|'Under Maintenance'|'Lost'|'Retired'|'Disposed'|'Pending Approval',
 *   condition: 'Excellent'|'Good'|'Fair'|'Poor',
 *   department: string|null, assignedTo: string|null, assignedToId: string|null,
 *   purchaseDate: string (ISO), purchaseValue: number, currentValue: number,
 *   location: string, serialNumber: string, description: string,
 *   warrantyExpiry: string (ISO), registeredDate: string (ISO), lastAuditDate: string (ISO),
 *   timeline: AssetTimelineEntry[]
 * }
 */
export const getAssets = (params = {}) =>
  axiosInstance.get('/assets', { params });

/**
 * GET /api/assets/:id
 * Returns: Asset (full detail with timeline)
 */
export const getAssetById = (id) =>
  axiosInstance.get(`/assets/${id}`);

/**
 * POST /api/assets
 * Body: { tag, name, category, condition, purchaseDate, purchaseValue, location, serialNumber, description, warrantyExpiry }
 * Returns: Asset
 */
export const createAsset = (data) =>
  axiosInstance.post('/assets', data);

/**
 * PUT /api/assets/:id
 * Body: Partial<Asset>
 * Returns: Asset
 */
export const updateAsset = (id, data) =>
  axiosInstance.put(`/assets/${id}`, data);

/**
 * DELETE /api/assets/:id
 * Returns: 204 No Content
 */
export const deleteAsset = (id) =>
  axiosInstance.delete(`/assets/${id}`);

/**
 * GET /api/assets/:id/timeline
 * Returns: AssetTimelineEntry[]
 * AssetTimelineEntry: { status: string, date: string, note: string, by: string }
 */
export const getAssetTimeline = (id) =>
  axiosInstance.get(`/assets/${id}/timeline`);

/**
 * GET /api/assets/:id/history
 * Returns: AssetHistoryEntry[]
 */
export const getAssetHistory = (id) =>
  axiosInstance.get(`/assets/${id}/history`);

/**
 * POST /api/assets/:id/retire
 * Body: { reason: string }
 * Returns: Asset
 */
export const retireAsset = (id, data) =>
  axiosInstance.post(`/assets/${id}/retire`, data);

/**
 * POST /api/assets/:id/dispose
 * Body: { reason: string, disposalValue: number }
 * Returns: Asset
 */
export const disposeAsset = (id, data) =>
  axiosInstance.post(`/assets/${id}/dispose`, data);

/**
 * GET /api/assets/export
 * Query: { format: 'csv'|'xlsx', ...filters }
 * Returns: Blob
 */
export const exportAssets = (params = {}) =>
  axiosInstance.get('/assets/export', { params, responseType: 'blob' });
