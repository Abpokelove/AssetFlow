import axiosInstance from './axiosInstance';

/**
 * Audit Service
 * =============
 * API calls for Audit cycle management.
 *
 * Audit shape:
 * {
 *   id: string, name: string, category: string,
 *   status: 'Scheduled'|'In Progress'|'Completed'|'Discrepancy Found',
 *   auditor: string, auditorId: string,
 *   department: string, startDate: string (ISO), endDate: string (ISO),
 *   totalAssets: number, verified: number, discrepancies: number,
 *   description: string
 * }
 *
 * AuditVerification shape:
 * {
 *   id: string, auditId: string, assetId: string, assetTag: string, assetName: string,
 *   verifiedBy: string, verifiedDate: string (ISO),
 *   physicalStatus: string, systemStatus: string,
 *   condition: string, location: string,
 *   hasDiscrepancy: boolean, discrepancyNote: string
 * }
 */

/**
 * GET /api/audits
 * Query: { page, pageSize, status, department, category }
 * Returns: { data: Audit[], total: number }
 */
export const getAudits = (params = {}) =>
  axiosInstance.get('/audits', { params });

/**
 * GET /api/audits/:id
 * Returns: Audit
 */
export const getAuditById = (id) =>
  axiosInstance.get(`/audits/${id}`);

/**
 * POST /api/audits
 * Body: { name, category, auditorId, department, startDate, endDate, description }
 * Returns: Audit
 */
export const createAudit = (data) =>
  axiosInstance.post('/audits', data);

/**
 * PUT /api/audits/:id
 * Body: Partial<Audit>
 * Returns: Audit
 */
export const updateAudit = (id, data) =>
  axiosInstance.put(`/audits/${id}`, data);

/**
 * POST /api/audits/:id/start
 * Returns: Audit (status = 'In Progress')
 */
export const startAudit = (id) =>
  axiosInstance.post(`/audits/${id}/start`);

/**
 * POST /api/audits/:id/complete
 * Returns: Audit (status = 'Completed' or 'Discrepancy Found')
 */
export const completeAudit = (id) =>
  axiosInstance.post(`/audits/${id}/complete`);

/**
 * GET /api/audits/:id/verifications
 * Returns: AuditVerification[]
 */
export const getAuditVerifications = (id) =>
  axiosInstance.get(`/audits/${id}/verifications`);

/**
 * POST /api/audits/:auditId/verify/:assetId
 * Body: { physicalStatus, condition, location, hasDiscrepancy, discrepancyNote? }
 * Returns: AuditVerification
 */
export const verifyAsset = (auditId, assetId, data) =>
  axiosInstance.post(`/audits/${auditId}/verify/${assetId}`, data);

/**
 * GET /api/audits/:id/report
 * Returns: Blob (PDF report)
 */
export const getAuditReport = (id) =>
  axiosInstance.get(`/audits/${id}/report`, { responseType: 'blob' });
