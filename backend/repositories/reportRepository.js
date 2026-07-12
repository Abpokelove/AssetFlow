const db = require("../db");

const reportRepository = {
  async dashboardSummary() {
    const result = await db.query(`
      SELECT
        (SELECT COUNT(*)::int FROM assets) AS "totalAssets",
        (SELECT COUNT(*)::int FROM assets WHERE status = 'Available') AS "availableAssets",
        (SELECT COUNT(*)::int FROM assets WHERE status = 'Allocated') AS "allocatedAssets",
        (SELECT COUNT(*)::int FROM assets WHERE status = 'Under Maintenance') AS "underMaintenance",
        (SELECT COUNT(*)::int FROM asset_allocations WHERE status = 'ACTIVE') AS "activeAllocations",
        (SELECT COUNT(*)::int FROM maintenance_requests WHERE status IN ('PENDING', 'APPROVED', 'TECHNICIAN_ASSIGNED', 'IN_PROGRESS')) AS "pendingMaintenance",
        (SELECT COUNT(*)::int FROM resource_bookings WHERE cancelled_at IS NULL AND start_time >= CURRENT_TIMESTAMP) AS "upcomingBookings",
        (SELECT COUNT(*)::int FROM audit_items WHERE status IN ('MISSING', 'DAMAGED')) AS "activeAuditAlerts",
        (SELECT COALESCE(SUM(purchase_value), 0)::numeric FROM assets) AS "totalPurchaseValue",
        (SELECT COALESCE(SUM(current_value), 0)::numeric FROM assets) AS "totalCurrentValue"
    `);
    return result.rows[0];
  },

  async assetTotalsByStatus() {
    const result = await db.query("SELECT status AS name, COUNT(*)::int AS value FROM assets GROUP BY status ORDER BY status");
    return result.rows;
  },

  async assetTotalsByCategory() {
    const result = await db.query("SELECT category AS name, COUNT(*)::int AS value FROM assets GROUP BY category ORDER BY category");
    return result.rows;
  },

  async assetTotalsByDepartment() {
    const result = await db.query(
      "SELECT COALESCE(department, 'Unassigned') AS name, COUNT(*)::int AS value FROM assets GROUP BY COALESCE(department, 'Unassigned') ORDER BY name"
    );
    return result.rows;
  },

  async recentActivity(limit = 10) {
    const result = await db.query(
      `SELECT al.id::text AS id, al.action, al.entity_type AS "entityType", al.entity_id AS "entityId",
              al.details, al.created_at AS "createdAt", e.name AS "employeeName"
       FROM activity_logs al
       LEFT JOIN employees e ON e.id = al.employee_id
       ORDER BY al.created_at DESC, al.id DESC
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  },

  async assetsReport({ page = 1, pageSize = 10, status, category, department } = {}) {
    const offset = (page - 1) * pageSize;
    const params = [];
    const conditions = [];
    if (status) {
      params.push(status);
      conditions.push(`status = $${params.length}`);
    }
    if (category) {
      params.push(category);
      conditions.push(`category = $${params.length}`);
    }
    if (department) {
      params.push(department);
      conditions.push(`department = $${params.length}`);
    }
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const count = await db.query(`SELECT COUNT(*) FROM assets ${where}`, params);
    const result = await db.query(
      `SELECT id, tag, name, category, status, condition, department, purchase_value AS "purchaseValue",
              current_value AS "currentValue", location, serial_number AS "serialNumber"
       FROM assets
       ${where}
       ORDER BY registered_date DESC NULLS LAST, id ASC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, pageSize, offset]
    );
    return {
      data: result.rows,
      total: parseInt(count.rows[0].count, 10),
      page,
      pageSize,
    };
  },

  async maintenanceReport({ page = 1, pageSize = 10, status } = {}) {
    const offset = (page - 1) * pageSize;
    const params = [];
    const where = status ? "WHERE mr.status = $1" : "";
    if (status) params.push(status);
    const count = await db.query(`SELECT COUNT(*) FROM maintenance_requests mr ${where}`, params);
    const result = await db.query(
      `SELECT mr.id::text AS id, a.tag AS "assetTag", a.name AS "assetName", mr.priority, mr.status,
              mr.estimated_cost AS "estimatedCost", mr.actual_cost AS "actualCost", mr.created_at AS "createdAt"
       FROM maintenance_requests mr
       INNER JOIN assets a ON a.id = mr.asset_id
       ${where}
       ORDER BY mr.created_at DESC, mr.id DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, pageSize, offset]
    );
    return {
      data: result.rows,
      total: parseInt(count.rows[0].count, 10),
      page,
      pageSize,
    };
  },

  async auditReport({ page = 1, pageSize = 10, status } = {}) {
    const offset = (page - 1) * pageSize;
    const params = [];
    const where = status ? "WHERE ac.status = $1" : "";
    if (status) params.push(status);
    const count = await db.query(`SELECT COUNT(*) FROM audit_cycles ac ${where}`, params);
    const result = await db.query(
      `SELECT ac.id::text AS id, ac.name, ac.status, ac.start_date AS "startDate", ac.end_date AS "endDate",
              COUNT(ai.id)::int AS "itemCount",
              COUNT(*) FILTER (WHERE ai.status IN ('MISSING', 'DAMAGED'))::int AS "alertCount"
       FROM audit_cycles ac
       LEFT JOIN audit_items ai ON ai.audit_cycle_id = ac.id
       ${where}
       GROUP BY ac.id
       ORDER BY ac.created_at DESC, ac.id DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, pageSize, offset]
    );
    return {
      data: result.rows,
      total: parseInt(count.rows[0].count, 10),
      page,
      pageSize,
    };
  },
};

module.exports = reportRepository;
