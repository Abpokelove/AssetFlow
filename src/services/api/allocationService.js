import axiosInstance from './axiosInstance';

/**
 * Allocation Service
 * ==================
 * API calls for Asset Allocation, Transfer, and Return.
 *
 * Allocation shape:
 * {
 *   id: string, assetId: string, assetName: string, assetTag: string,
 *   employeeId: string, employeeName: string, department: string,
 *   allocatedDate: string (ISO), expectedReturn: string|null (ISO),
 *   returnedDate: string|null (ISO), allocatedBy: string,
 *   status: 'Active'|'Returned', notes: string
 * }
 */

/**
 * GET /api/allocations
 * Query: { page, pageSize, status, department, search }
 * Returns: { data: Allocation[], total: number }
 */
export const getAllocations = (params = {}) =>
  axiosInstance.get('/allocations', { params });

/**
 * GET /api/allocations/:id
 * Returns: Allocation
 */
export const getAllocationById = (id) =>
  axiosInstance.get(`/allocations/${id}`);

/**
 * POST /api/allocations
 * Body: { assetId, employeeId, expectedReturn?, notes? }
 * Returns: Allocation
 * Side effect: asset status → 'Allocated'
 */
export const allocateAsset = (data) =>
  axiosInstance.post('/allocations', data);

/**
 * POST /api/allocations/:id/transfer
 * Body: { newEmployeeId, reason?, notes? }
 * Returns: Allocation (new)
 * Side effect: old allocation closed, new allocation created
 */
export const transferAsset = (id, data) =>
  axiosInstance.post(`/allocations/${id}/transfer`, data);

/**
 * POST /api/allocations/:id/return
 * Body: { condition: string, notes?: string, returnedDate: string }
 * Returns: Allocation (updated, status = 'Returned')
 * Side effect: asset status → 'Available'
 */
export const returnAsset = (id, data) =>
  axiosInstance.post(`/allocations/${id}/return`, data);

/**
 * GET /api/allocations/conflicts
 * Query: { assetId, startDate, endDate }
 * Returns: { hasConflict: boolean, conflictingAllocations: Allocation[] }
 */
export const checkAllocationConflict = (params) =>
  axiosInstance.get('/allocations/conflicts', { params });

/**
 * GET /api/allocations/overdue
 * Returns: Allocation[] (expectedReturn passed and not returned)
 */
export const getOverdueAllocations = () =>
  axiosInstance.get('/allocations/overdue');
