const db = require("../db");

const dashboardRepository = {
  async findAssetsForDashboard() {
    const res = await db.query(
      `SELECT
        id,
        tag,
        name,
        category,
        status,
        condition,
        department,
        assigned_to AS "assignedTo",
        assigned_to_id AS "assignedToId",
        purchase_date AS "purchaseDate",
        purchase_value AS "purchaseValue",
        current_value AS "currentValue",
        warranty_expiry AS "warrantyExpiry",
        registered_date AS "registeredDate",
        last_audit_date AS "lastAuditDate",
        timeline
       FROM assets
       ORDER BY registered_date DESC NULLS LAST, id ASC`
    );
    return res.rows;
  },
};

module.exports = dashboardRepository;
