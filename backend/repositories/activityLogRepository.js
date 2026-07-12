const db = require("../db");
const sanitizeDetails = require("../utils/safeDetails");

const mapLog = (row) => row && ({
  id: row.id,
  employeeId: row.employee_id,
  employeeName: row.employee_name,
  action: row.action,
  entityType: row.entity_type,
  entityId: row.entity_id,
  details: row.details || {},
  ipAddress: row.ip_address,
  createdAt: row.created_at,
});

const insertWithExecutor = async (executor, { employeeId, action, entityType, entityId, details, ipAddress }) => {
  const result = await executor.query(
    `INSERT INTO activity_logs (employee_id, action, entity_type, entity_id, details, ip_address)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, employee_id, action, entity_type, entity_id, details, ip_address, created_at`,
    [
      employeeId || null,
      action,
      entityType,
      entityId ? String(entityId) : null,
      JSON.stringify(sanitizeDetails(details || {})),
      ipAddress || null,
    ]
  );
  return mapLog(result.rows[0]);
};

const activityLogRepository = {
  async create(log, client = db) {
    return insertWithExecutor(client, log);
  },

  async findFiltered({ page = 1, pageSize = 10, action, entityType, employeeId } = {}) {
    const offset = (page - 1) * pageSize;
    const params = [];
    const conditions = [];

    if (action) {
      params.push(action);
      conditions.push(`al.action = $${params.length}`);
    }

    if (entityType) {
      params.push(entityType);
      conditions.push(`al.entity_type = $${params.length}`);
    }

    if (employeeId) {
      params.push(employeeId);
      conditions.push(`al.employee_id = $${params.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const countResult = await db.query(`SELECT COUNT(*) FROM activity_logs al ${where}`, params);
    const dataResult = await db.query(
      `SELECT al.id::text AS id, al.employee_id, e.name AS employee_name, al.action,
              al.entity_type, al.entity_id, al.details, al.ip_address, al.created_at
       FROM activity_logs al
       LEFT JOIN employees e ON e.id = al.employee_id
       ${where}
       ORDER BY al.created_at DESC, al.id DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, pageSize, offset]
    );

    return {
      data: dataResult.rows.map(mapLog),
      total: parseInt(countResult.rows[0].count, 10),
      page,
      pageSize,
    };
  },
};

module.exports = activityLogRepository;
