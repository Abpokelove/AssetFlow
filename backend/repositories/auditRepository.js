const db = require("../db");
const activityLogRepository = require("./activityLogRepository");

const mapCycle = (row) => row && ({
  id: String(row.id),
  name: row.name,
  departmentId: row.department_id,
  departmentName: row.department_name,
  location: row.location,
  startDate: row.start_date,
  endDate: row.end_date,
  status: row.status,
  createdBy: row.created_by,
  createdAt: row.created_at,
});

const mapItem = (row) => row && ({
  id: String(row.id),
  auditCycleId: String(row.audit_cycle_id),
  assetId: row.asset_id,
  assetName: row.asset_name,
  assetTag: row.asset_tag,
  status: row.status,
  expectedLocation: row.expected_location,
  observedLocation: row.observed_location,
  observedCondition: row.observed_condition,
  verifierId: row.verifier_id,
  verifierName: row.verifier_name,
  verifiedAt: row.verified_at,
});

const cycleSelect = `
  SELECT ac.id, ac.name, ac.department_id, d.name AS department_name, ac.location,
         ac.start_date, ac.end_date, ac.status, ac.created_by, ac.created_at
  FROM audit_cycles ac
  LEFT JOIN departments d ON d.id = ac.department_id
`;

const itemSelect = `
  SELECT ai.id, ai.audit_cycle_id, ai.asset_id, a.name AS asset_name, a.tag AS asset_tag,
         ai.status, ai.expected_location, ai.observed_location, ai.observed_condition,
         ai.verifier_id, verifier.name AS verifier_name, ai.verified_at
  FROM audit_items ai
  INNER JOIN assets a ON a.id = ai.asset_id
  LEFT JOIN employees verifier ON verifier.id = ai.verifier_id
`;

const auditRepository = {
  async findFiltered({ page = 1, pageSize = 10, status } = {}) {
    const offset = (page - 1) * pageSize;
    const params = [];
    const where = status ? "WHERE ac.status = $1" : "";
    if (status) params.push(status);

    const count = await db.query(`SELECT COUNT(*) FROM audit_cycles ac ${where}`, params);
    const result = await db.query(
      `${cycleSelect} ${where}
       ORDER BY ac.created_at DESC, ac.id DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, pageSize, offset]
    );
    return {
      data: result.rows.map(mapCycle),
      total: parseInt(count.rows[0].count, 10),
      page,
      pageSize,
    };
  },

  async createCycle({ name, departmentId, location, startDate, endDate, actor, ipAddress }) {
    const client = await db.pool.connect();
    try {
      await client.query("BEGIN");
      const result = await client.query(
        `INSERT INTO audit_cycles (name, department_id, location, start_date, end_date, created_by)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [name, departmentId || null, location || null, startDate, endDate, actor.id]
      );
      await activityLogRepository.create({
        employeeId: actor.id,
        action: "CREATE",
        entityType: "AUDIT",
        entityId: result.rows[0].id,
        details: { name, departmentId, startDate, endDate },
        ipAddress,
      }, client);
      await client.query("COMMIT");
      return this.getCycleDetails(result.rows[0].id);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  async getCycleDetails(id) {
    const cycle = await db.query(`${cycleSelect} WHERE ac.id = $1`, [id]);
    if (cycle.rowCount === 0) return null;
    const assignments = await db.query(
      `SELECT aa.auditor_id AS "auditorId", e.name AS "auditorName", aa.assigned_at AS "assignedAt"
       FROM audit_assignments aa
       INNER JOIN employees e ON e.id = aa.auditor_id
       WHERE aa.audit_cycle_id = $1
       ORDER BY aa.assigned_at DESC`,
      [id]
    );
    const items = await db.query(`${itemSelect} WHERE ai.audit_cycle_id = $1 ORDER BY ai.id ASC`, [id]);
    return {
      ...mapCycle(cycle.rows[0]),
      assignments: assignments.rows,
      items: items.rows.map(mapItem),
    };
  },

  async assignAuditor(id, { auditorId, actor, ipAddress }) {
    const client = await db.pool.connect();
    try {
      await client.query("BEGIN");
      await client.query("INSERT INTO audit_assignments (audit_cycle_id, auditor_id) VALUES ($1, $2)", [id, auditorId]);
      await activityLogRepository.create({
        employeeId: actor.id,
        action: "ASSIGN",
        entityType: "AUDIT",
        entityId: id,
        details: { auditorId },
        ipAddress,
      }, client);
      await client.query("COMMIT");
      return this.getCycleDetails(id);
    } catch (error) {
      await client.query("ROLLBACK");
      if (error.code === "23505") {
        error.statusCode = 409;
        error.message = "Auditor is already assigned to this audit";
      }
      throw error;
    } finally {
      client.release();
    }
  },

  async addItem(id, { assetId, expectedLocation, actor, ipAddress }) {
    const client = await db.pool.connect();
    try {
      await client.query("BEGIN");
      const cycle = await client.query("SELECT status FROM audit_cycles WHERE id = $1 FOR UPDATE", [id]);
      if (cycle.rowCount === 0) {
        const error = new Error("Audit cycle not found");
        error.statusCode = 404;
        throw error;
      }
      if (!["DRAFT", "ACTIVE"].includes(cycle.rows[0].status)) {
        const error = new Error("Cannot add items to a closed audit");
        error.statusCode = 409;
        throw error;
      }
      await client.query(
        "INSERT INTO audit_items (audit_cycle_id, asset_id, expected_location) VALUES ($1, $2, $3)",
        [id, assetId, expectedLocation || null]
      );
      await activityLogRepository.create({
        employeeId: actor.id,
        action: "CREATE",
        entityType: "AUDIT_ITEM",
        entityId: assetId,
        details: { auditCycleId: id, assetId },
        ipAddress,
      }, client);
      await client.query("COMMIT");
      return this.getCycleDetails(id);
    } catch (error) {
      await client.query("ROLLBACK");
      if (error.code === "23505") {
        error.statusCode = 409;
        error.message = "Asset already exists in this audit cycle";
      }
      throw error;
    } finally {
      client.release();
    }
  },

  async updateItem(auditId, itemId, { status, observedLocation, observedCondition, verifierId, actor, ipAddress }) {
    const client = await db.pool.connect();
    try {
      await client.query("BEGIN");
      const cycle = await client.query("SELECT status FROM audit_cycles WHERE id = $1 FOR UPDATE", [auditId]);
      if (cycle.rowCount === 0) {
        const error = new Error("Audit cycle not found");
        error.statusCode = 404;
        throw error;
      }
      if (cycle.rows[0].status !== "ACTIVE") {
        const error = new Error("Audit cycle must be active to update items");
        error.statusCode = 409;
        throw error;
      }
      const result = await client.query(
        `UPDATE audit_items
         SET status = $1, observed_location = $2, observed_condition = $3,
             verifier_id = $4, verified_at = CURRENT_TIMESTAMP
         WHERE id = $5 AND audit_cycle_id = $6
         RETURNING id`,
        [status, observedLocation || null, observedCondition || null, verifierId, itemId, auditId]
      );
      if (result.rowCount === 0) {
        const error = new Error("Audit item not found");
        error.statusCode = 404;
        throw error;
      }
      await activityLogRepository.create({
        employeeId: actor.id,
        action: "UPDATE",
        entityType: "AUDIT_ITEM",
        entityId: itemId,
        details: { status, observedLocation, observedCondition },
        ipAddress,
      }, client);
      await client.query("COMMIT");
      return this.getCycleDetails(auditId);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  async closeCycle(id, { actor, ipAddress }) {
    const client = await db.pool.connect();
    try {
      await client.query("BEGIN");
      const result = await client.query(
        "UPDATE audit_cycles SET status = 'CLOSED' WHERE id = $1 AND status = 'ACTIVE' RETURNING id",
        [id]
      );
      if (result.rowCount === 0) {
        const error = new Error("Only active audit cycles can be closed");
        error.statusCode = 409;
        throw error;
      }
      await activityLogRepository.create({
        employeeId: actor.id,
        action: "CLOSE",
        entityType: "AUDIT",
        entityId: id,
        details: {},
        ipAddress,
      }, client);
      await client.query("COMMIT");
      return this.getCycleDetails(id);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  async activateCycle(id, { actor, ipAddress }) {
    const client = await db.pool.connect();
    try {
      await client.query("BEGIN");
      const result = await client.query(
        "UPDATE audit_cycles SET status = 'ACTIVE' WHERE id = $1 AND status = 'DRAFT' RETURNING id",
        [id]
      );
      if (result.rowCount === 0) {
        const error = new Error("Only draft audit cycles can be activated");
        error.statusCode = 409;
        throw error;
      }
      await activityLogRepository.create({
        employeeId: actor.id,
        action: "ACTIVATE",
        entityType: "AUDIT",
        entityId: id,
        details: {},
        ipAddress,
      }, client);
      await client.query("COMMIT");
      return this.getCycleDetails(id);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },
};

module.exports = auditRepository;
