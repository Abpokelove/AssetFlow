const db = require("../db");

const assetRepository = {
  async findFiltered({ page = 1, pageSize = 10, status, category, department, search }) {
    const offset = (page - 1) * pageSize;
    const params = [];
    const conditions = [];

    let query = `
      SELECT 
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
        location, 
        serial_number AS "serialNumber", 
        description, 
        warranty_expiry AS "warrantyExpiry", 
        registered_date AS "registeredDate", 
        last_audit_date AS "lastAuditDate", 
        timeline
      FROM assets
    `;

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

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(name ILIKE $${params.length} OR tag ILIKE $${params.length} OR serial_number ILIKE $${params.length} OR assigned_to ILIKE $${params.length})`);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    // Count total matching
    const countQuery = `SELECT COUNT(*) FROM (${query}) AS temp`;
    const countRes = await db.query(countQuery, params);
    const total = parseInt(countRes.rows[0].count, 10);

    // Add ordering and pagination
    query += ` ORDER BY id ASC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(pageSize, offset);

    const dataRes = await db.query(query, params);

    return {
      data: dataRes.rows,
      total,
      page,
      pageSize,
    };
  },

  async findById(id) {
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
        location, 
        serial_number AS "serialNumber", 
        description, 
        warranty_expiry AS "warrantyExpiry", 
        registered_date AS "registeredDate", 
        last_audit_date AS "lastAuditDate", 
        timeline
       FROM assets WHERE id = $1`,
      [id]
    );
    return res.rows[0];
  },

  async findByTag(tag) {
    const res = await db.query("SELECT id FROM assets WHERE tag = $1", [tag]);
    return res.rows[0];
  },

  async findBySerialNumber(serialNumber) {
    const res = await db.query("SELECT id FROM assets WHERE serial_number = $1", [serialNumber]);
    return res.rows[0];
  },

  async create(data) {
    const {
      tag,
      name,
      category,
      condition = "Good",
      purchaseDate,
      purchaseValue = 0,
      currentValue = purchaseValue,
      location,
      serialNumber,
      description,
      warrantyExpiry,
      status = "Available",
      department = null,
      assignedTo = null,
      assignedToId = null,
      timeline = []
    } = data;

    // Generate a new ID in format ast-XXX
    const idRes = await db.query("SELECT id FROM assets WHERE id LIKE 'ast-%'");
    let nextNum = 1;
    if (idRes.rows.length > 0) {
      const nums = idRes.rows.map(r => parseInt(r.id.split("-")[1], 10)).filter(n => !isNaN(n));
      if (nums.length > 0) {
        nextNum = Math.max(...nums) + 1;
      }
    }
    const newId = `ast-${String(nextNum).padStart(3, '0')}`;

    const client = await db.pool.connect();
    try {
      await client.query("BEGIN");

      const res = await client.query(
        `INSERT INTO assets (
          id, tag, name, category, status, condition, department, assigned_to, assigned_to_id, 
          purchase_date, purchase_value, current_value, location, serial_number, description, 
          warranty_expiry, registered_date, last_audit_date, timeline
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, 
          $10, $11, $12, $13, $14, $15, 
          $16, CURRENT_TIMESTAMP, NULL, $17
        ) RETURNING 
          id, tag, name, category, status, condition, department, 
          assigned_to AS "assignedTo", assigned_to_id AS "assignedToId", 
          purchase_date AS "purchaseDate", purchase_value AS "purchaseValue", 
          current_value AS "currentValue", location, serial_number AS "serialNumber", 
          description, warranty_expiry AS "warrantyExpiry", 
          registered_date AS "registeredDate", last_audit_date AS "lastAuditDate", 
          timeline`,
        [
          newId, tag, name, category, status, condition, department, assignedTo, assignedToId,
          purchaseDate, purchaseValue, currentValue, location, serialNumber || null, description || null,
          warrantyExpiry || null, JSON.stringify(timeline)
        ]
      );

      // Update asset count in category table
      await client.query(
        "UPDATE asset_categories SET asset_count = asset_count + 1 WHERE name = $1",
        [category]
      );

      // Update asset count in department table if set
      if (department) {
        await client.query(
          "UPDATE departments SET asset_count = asset_count + 1 WHERE name = $1",
          [department]
        );
      }

      await client.query("COMMIT");
      return res.rows[0];
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }
};

module.exports = assetRepository;
