const db = require("../db");
const activityLogRepository = require("./activityLogRepository");

const mapBooking = (row) => row && ({
  id: String(row.id),
  assetId: row.asset_id,
  assetName: row.asset_name,
  assetTag: row.asset_tag,
  employeeId: row.employee_id,
  employeeName: row.employee_name,
  startTime: row.start_time,
  endTime: row.end_time,
  purpose: row.purpose,
  createdAt: row.created_at,
  cancelledAt: row.cancelled_at,
  cancelledBy: row.cancelled_by,
});

const selectBookings = `
  SELECT rb.id, rb.asset_id, a.name AS asset_name, a.tag AS asset_tag,
         rb.employee_id, e.name AS employee_name, rb.start_time, rb.end_time,
         rb.purpose, rb.created_at, rb.cancelled_at, rb.cancelled_by
  FROM resource_bookings rb
  INNER JOIN assets a ON a.id = rb.asset_id
  INNER JOIN employees e ON e.id = rb.employee_id
`;

const bookingRepository = {
  async findFiltered({ page = 1, pageSize = 10, employeeId, assetId, activeOnly = false } = {}) {
    const offset = (page - 1) * pageSize;
    const params = [];
    const conditions = [];

    if (employeeId) {
      params.push(employeeId);
      conditions.push(`rb.employee_id = $${params.length}`);
    }
    if (assetId) {
      params.push(assetId);
      conditions.push(`rb.asset_id = $${params.length}`);
    }
    if (activeOnly) {
      conditions.push("rb.cancelled_at IS NULL");
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const count = await db.query(`SELECT COUNT(*) FROM resource_bookings rb ${where}`, params);
    const result = await db.query(
      `${selectBookings} ${where}
       ORDER BY rb.start_time DESC, rb.id DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, pageSize, offset]
    );
    return {
      data: result.rows.map(mapBooking),
      total: parseInt(count.rows[0].count, 10),
      page,
      pageSize,
    };
  },

  async findById(id) {
    const result = await db.query(`${selectBookings} WHERE rb.id = $1`, [id]);
    return mapBooking(result.rows[0]);
  },

  async create({ assetId, employeeId, startTime, endTime, purpose, actor, ipAddress }) {
    const client = await db.pool.connect();
    try {
      await client.query("BEGIN");
      const assetResult = await client.query("SELECT id, name, status FROM assets WHERE id = $1 FOR UPDATE", [assetId]);
      const asset = assetResult.rows[0];
      if (!asset) {
        const error = new Error("Asset not found");
        error.statusCode = 404;
        throw error;
      }
      if (["Under Maintenance", "Retired", "Disposed", "Lost"].includes(asset.status)) {
        const error = new Error("Asset is not bookable");
        error.statusCode = 409;
        throw error;
      }

      const result = await client.query(
        `INSERT INTO resource_bookings (asset_id, employee_id, start_time, end_time, purpose)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [assetId, employeeId, startTime, endTime, purpose]
      );

      await activityLogRepository.create({
        employeeId: actor.id,
        action: "CREATE",
        entityType: "BOOKING",
        entityId: result.rows[0].id,
        details: { assetId, startTime, endTime, purpose },
        ipAddress,
      }, client);

      await client.query("COMMIT");
      return this.findById(result.rows[0].id);
    } catch (error) {
      await client.query("ROLLBACK");
      if (error.code === "23P01") {
        error.statusCode = 409;
        error.message = "Booking overlaps an existing active booking";
      }
      throw error;
    } finally {
      client.release();
    }
  },

  async cancel(id, { actor, ipAddress }) {
    const client = await db.pool.connect();
    try {
      await client.query("BEGIN");
      const result = await client.query(
        `UPDATE resource_bookings
         SET cancelled_at = CURRENT_TIMESTAMP, cancelled_by = $1
         WHERE id = $2 AND cancelled_at IS NULL
         RETURNING id`,
        [actor.id, id]
      );
      if (result.rowCount === 0) {
        const error = new Error("Active booking not found");
        error.statusCode = 404;
        throw error;
      }
      await activityLogRepository.create({
        employeeId: actor.id,
        action: "CANCEL",
        entityType: "BOOKING",
        entityId: id,
        details: {},
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

module.exports = bookingRepository;
