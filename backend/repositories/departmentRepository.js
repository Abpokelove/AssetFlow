const db = require("../db");

const departmentRepository = {
  async findAll({ search, manager } = {}) {
    const params = [];
    const conditions = [];
    let query = 'SELECT id, name, head_count AS "headCount", asset_count AS "assetCount", manager FROM departments';

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(name ILIKE $${params.length} OR manager ILIKE $${params.length})`);
    }

    if (manager) {
      params.push(manager);
      conditions.push(`manager = $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    query += " ORDER BY id ASC";
    const res = await db.query(query, params);
    return res.rows;
  },

  async create({ name, manager }) {
    // Generate next id dept-XX
    const idRes = await db.query("SELECT id FROM departments WHERE id LIKE 'dept-%'");
    let nextNum = 1;
    if (idRes.rows.length > 0) {
      const nums = idRes.rows.map(r => parseInt(r.id.split("-")[1], 10)).filter(n => !isNaN(n));
      if (nums.length > 0) {
        nextNum = Math.max(...nums) + 1;
      }
    }
    const newId = `dept-${String(nextNum).padStart(2, '0')}`;

    const res = await db.query(
      "INSERT INTO departments (id, name, head_count, asset_count, manager) VALUES ($1, $2, 0, 0, $3) RETURNING id, name, head_count AS \"headCount\", asset_count AS \"assetCount\", manager",
      [newId, name, manager || null]
    );
    return res.rows[0];
  },

  async findByName(name) {
    const res = await db.query(
      "SELECT id, name FROM departments WHERE name = $1",
      [name]
    );
    return res.rows[0];
  },

  async findById(id) {
    const res = await db.query(
      'SELECT id, name, head_count AS "headCount", asset_count AS "assetCount", manager FROM departments WHERE id = $1',
      [id]
    );
    return res.rows[0];
  },

  async update(id, data) {
    const fields = [];
    const params = [];

    if (Object.prototype.hasOwnProperty.call(data, "name")) {
      params.push(data.name);
      fields.push(`name = $${params.length}`);
    }

    if (Object.prototype.hasOwnProperty.call(data, "manager")) {
      params.push(data.manager || null);
      fields.push(`manager = $${params.length}`);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    params.push(id);
    const res = await db.query(
      `UPDATE departments
       SET ${fields.join(", ")}
       WHERE id = $${params.length}
       RETURNING id, name, head_count AS "headCount", asset_count AS "assetCount", manager`,
      params
    );
    return res.rows[0];
  }
};

module.exports = departmentRepository;
