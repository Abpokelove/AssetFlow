const db = require("../db");
const activityLogRepository = require("./activityLogRepository");
const notificationRepository = require("./notificationRepository");

const mapTransfer = (row) => row && ({
  id: String(row.id),
  assetId: row.asset_id,
  assetName: row.asset_name,
  assetTag: row.asset_tag,
  currentAllocationId: row.current_allocation_id ? String(row.current_allocation_id) : null,
  requestedBy: row.requested_by,
  requestedByName: row.requested_by_name,
  toEmployeeId: row.to_employee_id,
  toEmployeeName: row.to_employee_name,
  toDepartmentId: row.to_department_id,
  toDepartmentName: row.to_department_name,
  reason: row.reason,
  status: row.status,
  approvedBy: row.approved_by,
  approvedByName: row.approved_by_name,
  requestedAt: row.requested_at,
  decidedAt: row.decided_at,
});

const selectTransfers = `
  SELECT tr.id, tr.asset_id, a.name AS asset_name, a.tag AS asset_tag,
         tr.current_allocation_id, tr.requested_by, requester.name AS requested_by_name,
         tr.to_employee_id, target_employee.name AS to_employee_name,
         tr.to_department_id, target_department.name AS to_department_name,
         tr.reason, tr.status, tr.approved_by, approver.name AS approved_by_name,
         tr.requested_at, tr.decided_at
  FROM transfer_requests tr
  INNER JOIN assets a ON a.id = tr.asset_id
  INNER JOIN employees requester ON requester.id = tr.requested_by
  LEFT JOIN employees target_employee ON target_employee.id = tr.to_employee_id
  LEFT JOIN departments target_department ON target_department.id = tr.to_department_id
  LEFT JOIN employees approver ON approver.id = tr.approved_by
`;

const appendTimeline = (timeline, entry) => JSON.stringify([...(Array.isArray(timeline) ? timeline : []), entry]);

const resolveTarget = async (client, employeeId, departmentId) => {
  if (employeeId) {
    const result = await client.query("SELECT id, name, department FROM employees WHERE id = $1", [employeeId]);
    const employee = result.rows[0];
    if (!employee) {
      const error = new Error("Target employee not found");
      error.statusCode = 404;
      throw error;
    }
    return { assigneeName: employee.name, departmentName: employee.department || null };
  }

  const result = await client.query("SELECT id, name FROM departments WHERE id = $1", [departmentId]);
  const department = result.rows[0];
  if (!department) {
    const error = new Error("Target department not found");
    error.statusCode = 404;
    throw error;
  }
  return { assigneeName: department.name, departmentName: department.name };
};

const transferRepository = {
  async findFiltered({ page = 1, pageSize = 10, status, requestedBy } = {}) {
    const offset = (page - 1) * pageSize;
    const params = [];
    const conditions = [];

    if (status) {
      params.push(status);
      conditions.push(`tr.status = $${params.length}`);
    }

    if (requestedBy) {
      params.push(requestedBy);
      conditions.push(`tr.requested_by = $${params.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const count = await db.query(`SELECT COUNT(*) FROM transfer_requests tr ${where}`, params);
    const result = await db.query(
      `${selectTransfers} ${where}
       ORDER BY tr.requested_at DESC, tr.id DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, pageSize, offset]
    );

    return {
      data: result.rows.map(mapTransfer),
      total: parseInt(count.rows[0].count, 10),
      page,
      pageSize,
    };
  },

  async findById(id) {
    const result = await db.query(`${selectTransfers} WHERE tr.id = $1`, [id]);
    return mapTransfer(result.rows[0]);
  },

  async create({ assetId, toEmployeeId, toDepartmentId, reason, actor, ipAddress }) {
    const client = await db.pool.connect();
    try {
      await client.query("BEGIN");

      const allocationResult = await client.query(
        `SELECT aa.*
         FROM asset_allocations aa
         WHERE aa.asset_id = $1 AND aa.status = 'ACTIVE'
         FOR UPDATE`,
        [assetId]
      );
      const allocation = allocationResult.rows[0];
      if (!allocation) {
        const error = new Error("Active allocation not found for asset");
        error.statusCode = 409;
        throw error;
      }

      await resolveTarget(client, toEmployeeId, toDepartmentId);

      const result = await client.query(
        `INSERT INTO transfer_requests (
          asset_id, current_allocation_id, requested_by, to_employee_id, to_department_id, reason
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id`,
        [assetId, allocation.id, actor.id, toEmployeeId || null, toDepartmentId || null, reason || null]
      );

      await activityLogRepository.create({
        employeeId: actor.id,
        action: "CREATE",
        entityType: "TRANSFER",
        entityId: result.rows[0].id,
        details: { assetId, toEmployeeId, toDepartmentId, reason },
        ipAddress,
      }, client);

      await client.query("COMMIT");
      return this.findById(result.rows[0].id);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  async approve(id, { actor, ipAddress }) {
    const client = await db.pool.connect();
    try {
      await client.query("BEGIN");

      const requestResult = await client.query("SELECT * FROM transfer_requests WHERE id = $1 FOR UPDATE", [id]);
      const request = requestResult.rows[0];
      if (!request) {
        const error = new Error("Transfer request not found");
        error.statusCode = 404;
        throw error;
      }
      if (request.status !== "REQUESTED") {
        const error = new Error("Only requested transfers can be approved");
        error.statusCode = 409;
        throw error;
      }

      const allocationResult = await client.query(
        "SELECT * FROM asset_allocations WHERE id = $1 AND status = 'ACTIVE' FOR UPDATE",
        [request.current_allocation_id]
      );
      const allocation = allocationResult.rows[0];
      if (!allocation) {
        const error = new Error("Active allocation not found");
        error.statusCode = 409;
        throw error;
      }

      const assetResult = await client.query("SELECT * FROM assets WHERE id = $1 FOR UPDATE", [request.asset_id]);
      const asset = assetResult.rows[0];
      const target = await resolveTarget(client, request.to_employee_id, request.to_department_id);

      await client.query(
        "UPDATE asset_allocations SET status = 'TRANSFERRED', returned_at = CURRENT_TIMESTAMP WHERE id = $1",
        [allocation.id]
      );

      const newAllocation = await client.query(
        `INSERT INTO asset_allocations (asset_id, employee_id, department_id, allocated_by, condition_on_issue, notes)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [
          request.asset_id,
          request.to_employee_id || null,
          request.to_department_id || null,
          actor.id,
          asset.condition,
          request.reason || "Transfer approved",
        ]
      );

      await client.query(
        "UPDATE transfer_requests SET status = 'APPROVED', approved_by = $1, decided_at = CURRENT_TIMESTAMP WHERE id = $2",
        [actor.id, id]
      );

      await client.query(
        `UPDATE assets
         SET assigned_to = $1, assigned_to_id = $2, department = $3, status = 'Allocated', timeline = $4
         WHERE id = $5`,
        [
          target.assigneeName,
          request.to_employee_id || null,
          target.departmentName,
          appendTimeline(asset.timeline, {
            status: "Allocated",
            date: new Date().toISOString(),
            note: request.reason || `Transferred to ${target.assigneeName}`,
            by: actor.name,
          }),
          request.asset_id,
        ]
      );

      await notificationRepository.create({
        employeeId: request.requested_by,
        title: "Transfer approved",
        message: `${asset.name} transfer request was approved.`,
        type: "TRANSFER",
      }, client);

      await activityLogRepository.create({
        employeeId: actor.id,
        action: "APPROVE",
        entityType: "TRANSFER",
        entityId: id,
        details: { assetId: request.asset_id, newAllocationId: newAllocation.rows[0].id },
        ipAddress,
      }, client);

      await client.query("COMMIT");
      return this.findById(id);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  async reject(id, { actor, reason, ipAddress }) {
    const client = await db.pool.connect();
    try {
      await client.query("BEGIN");
      const result = await client.query(
        `UPDATE transfer_requests
         SET status = 'REJECTED', approved_by = $1, decided_at = CURRENT_TIMESTAMP,
             reason = COALESCE($2, reason)
         WHERE id = $3 AND status = 'REQUESTED'
         RETURNING requested_by`,
        [actor.id, reason || null, id]
      );

      if (result.rowCount === 0) {
        const error = new Error("Requested transfer not found");
        error.statusCode = 404;
        throw error;
      }

      await notificationRepository.create({
        employeeId: result.rows[0].requested_by,
        title: "Transfer rejected",
        message: "Your transfer request was rejected.",
        type: "TRANSFER",
      }, client);

      await activityLogRepository.create({
        employeeId: actor.id,
        action: "REJECT",
        entityType: "TRANSFER",
        entityId: id,
        details: { reason },
        ipAddress,
      }, client);

      await client.query("COMMIT");
      return this.findById(id);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },
};

module.exports = transferRepository;
