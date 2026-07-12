const db = require("../db");

const mapNotification = (row) => row && ({
  id: String(row.id),
  employeeId: row.employee_id,
  title: row.title,
  message: row.message,
  type: row.type,
  read: row.is_read,
  isRead: row.is_read,
  createdAt: row.created_at,
  readAt: row.read_at,
});

const notificationRepository = {
  async create({ employeeId, title, message, type }, client = db) {
    if (!employeeId) {
      return null;
    }

    const result = await client.query(
      `INSERT INTO notifications (employee_id, title, message, type)
       VALUES ($1, $2, $3, $4)
       RETURNING id, employee_id, title, message, type, is_read, created_at, read_at`,
      [employeeId, title, message, type || null]
    );
    return mapNotification(result.rows[0]);
  },

  async findForEmployee(employeeId, { page = 1, pageSize = 10, read, type } = {}) {
    const offset = (page - 1) * pageSize;
    const params = [employeeId];
    const conditions = ["employee_id = $1"];

    if (read !== undefined) {
      params.push(read);
      conditions.push(`is_read = $${params.length}`);
    }

    if (type) {
      params.push(type);
      conditions.push(`type = $${params.length}`);
    }

    const where = `WHERE ${conditions.join(" AND ")}`;
    const countResult = await db.query(`SELECT COUNT(*) FROM notifications ${where}`, params);
    const dataResult = await db.query(
      `SELECT id, employee_id, title, message, type, is_read, created_at, read_at
       FROM notifications
       ${where}
       ORDER BY created_at DESC, id DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, pageSize, offset]
    );

    return {
      data: dataResult.rows.map(mapNotification),
      total: parseInt(countResult.rows[0].count, 10),
      page,
      pageSize,
    };
  },

  async markRead(employeeId, id) {
    const result = await db.query(
      `UPDATE notifications
       SET is_read = TRUE, read_at = COALESCE(read_at, CURRENT_TIMESTAMP)
       WHERE id = $1 AND employee_id = $2
       RETURNING id, employee_id, title, message, type, is_read, created_at, read_at`,
      [id, employeeId]
    );
    return mapNotification(result.rows[0]);
  },

  async markAllRead(employeeId) {
    const result = await db.query(
      `UPDATE notifications
       SET is_read = TRUE, read_at = COALESCE(read_at, CURRENT_TIMESTAMP)
       WHERE employee_id = $1 AND is_read = FALSE
       RETURNING id`,
      [employeeId]
    );
    return result.rowCount;
  },
};

module.exports = notificationRepository;
