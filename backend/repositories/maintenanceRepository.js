const db = require("../db");
const activityLogRepository = require("./activityLogRepository");
const notificationRepository = require("./notificationRepository");

const mapMaintenance = (row) => row && ({
  id: String(row.id),
  assetId: row.asset_id,
  assetName: row.asset_name,
  assetTag: row.asset_tag,
  reporterId: row.reporter_id,
  reporterName: row.reporter_name,
  approverId: row.approver_id,
  technicianId: row.technician_id,
  technicianName: row.technician_name,
  description: row.description,
  priority: row.priority,
  status: row.status,
  estimatedCost: row.estimated_cost,
  actualCost: row.actual_cost,
  resolutionNotes: row.resolution_notes,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const selectMaintenance = `
  SELECT mr.id, mr.asset_id, a.name AS asset_name, a.tag AS asset_tag,
         mr.reporter_id, reporter.name AS reporter_name, mr.approver_id,
         mr.technician_id, technician.name AS technician_name,
         mr.description, mr.priority, mr.status, mr.estimated_cost, mr.actual_cost,
         mr.resolution_notes, mr.created_at, mr.updated_at
  FROM maintenance_requests mr
  INNER JOIN assets a ON a.id = mr.asset_id
  LEFT JOIN employees reporter ON reporter.id = mr.reporter_id
  LEFT JOIN employees technician ON technician.id = mr.technician_id
`;

const appendTimeline = (timeline, entry) => JSON.stringify([...(Array.isArray(timeline) ? timeline : []), entry]);

const maintenanceRepository = {
  async findFiltered({ page = 1, pageSize = 10, status, assetId, reporterId } = {}) {
    const offset = (page - 1) * pageSize;
    const params = [];
    const conditions = [];

    if (status) {
      params.push(status);
      conditions.push(`mr.status = $${params.length}`);
    }
    if (assetId) {
      params.push(assetId);
      conditions.push(`mr.asset_id = $${params.length}`);
    }
    if (reporterId) {
      params.push(reporterId);
      conditions.push(`mr.reporter_id = $${params.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const count = await db.query(`SELECT COUNT(*) FROM maintenance_requests mr ${where}`, params);
    const result = await db.query(
      `${selectMaintenance} ${where}
       ORDER BY mr.created_at DESC, mr.id DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, pageSize, offset]
    );
    return {
      data: result.rows.map(mapMaintenance),
      total: parseInt(count.rows[0].count, 10),
      page,
      pageSize,
    };
  },

  async findById(id) {
    const result = await db.query(`${selectMaintenance} WHERE mr.id = $1`, [id]);
    return mapMaintenance(result.rows[0]);
  },

  async create({ assetId, reporterId, description, priority, estimatedCost, actor, ipAddress }) {
    const client = await db.pool.connect();
    try {
      await client.query("BEGIN");
      const asset = await client.query("SELECT id FROM assets WHERE id = $1", [assetId]);
      if (asset.rowCount === 0) {
        const error = new Error("Asset not found");
        error.statusCode = 404;
        throw error;
      }
      const result = await client.query(
        `INSERT INTO maintenance_requests (asset_id, reporter_id, description, priority, estimated_cost)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [assetId, reporterId, description, priority, estimatedCost || 0]
      );
      await activityLogRepository.create({
        employeeId: actor.id,
        action: "CREATE",
        entityType: "MAINTENANCE",
        entityId: result.rows[0].id,
        details: { assetId, priority },
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

  async transition(id, { expectedStatuses, nextStatus, actor, updates = {}, assetStatus, timelineNote, notification, ipAddress }) {
    const client = await db.pool.connect();
    try {
      await client.query("BEGIN");
      const requestResult = await client.query("SELECT * FROM maintenance_requests WHERE id = $1 FOR UPDATE", [id]);
      const request = requestResult.rows[0];
      if (!request) {
        const error = new Error("Maintenance request not found");
        error.statusCode = 404;
        throw error;
      }
      if (!expectedStatuses.includes(request.status)) {
        const error = new Error("Invalid maintenance transition");
        error.statusCode = 409;
        throw error;
      }

      const fields = ["status = $1", "updated_at = CURRENT_TIMESTAMP"];
      const params = [nextStatus];

      Object.entries(updates).forEach(([column, value]) => {
        params.push(value);
        fields.push(`${column} = $${params.length}`);
      });

      params.push(id);
      await client.query(`UPDATE maintenance_requests SET ${fields.join(", ")} WHERE id = $${params.length}`, params);

      if (assetStatus) {
        const assetResult = await client.query("SELECT * FROM assets WHERE id = $1 FOR UPDATE", [request.asset_id]);
        const asset = assetResult.rows[0];
        await client.query(
          "UPDATE assets SET status = $1, timeline = $2 WHERE id = $3",
          [
            assetStatus,
            appendTimeline(asset.timeline, {
              status: assetStatus,
              date: new Date().toISOString(),
              note: timelineNote || `Maintenance ${nextStatus.toLowerCase()}`,
              by: actor.name,
            }),
            request.asset_id,
          ]
        );
      }

      if (notification) {
        await notificationRepository.create(notification, client);
      }

      await activityLogRepository.create({
        employeeId: actor.id,
        action: nextStatus === "RESOLVED" ? "RESOLVE" : nextStatus,
        entityType: "MAINTENANCE",
        entityId: id,
        details: { from: request.status, to: nextStatus, updates },
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

module.exports = maintenanceRepository;
