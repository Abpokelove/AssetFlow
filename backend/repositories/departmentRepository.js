const db = require("../db");

const departmentRepository = {
  async findAll() {
    const res = await db.query(
      'SELECT id, name, head_count AS "headCount", asset_count AS "assetCount", manager FROM departments ORDER BY id ASC'
    );
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
  }
};

module.exports = departmentRepository;
