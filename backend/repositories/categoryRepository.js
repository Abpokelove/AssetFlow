const db = require("../db");

const categoryRepository = {
  async findAll({ search, icon } = {}) {
    const params = [];
    const conditions = [];
    let query = 'SELECT id, name, description, asset_count AS "assetCount", icon FROM asset_categories';

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(name ILIKE $${params.length} OR description ILIKE $${params.length})`);
    }

    if (icon) {
      params.push(icon);
      conditions.push(`icon = $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    query += " ORDER BY id ASC";
    const res = await db.query(query, params);
    return res.rows;
  },

  async create({ name, description, icon = "Monitor" }) {
    // Generate next id cat-XX
    const idRes = await db.query("SELECT id FROM asset_categories WHERE id LIKE 'cat-%'");
    let nextNum = 1;
    if (idRes.rows.length > 0) {
      const nums = idRes.rows.map(r => parseInt(r.id.split("-")[1], 10)).filter(n => !isNaN(n));
      if (nums.length > 0) {
        nextNum = Math.max(...nums) + 1;
      }
    }
    const newId = `cat-${String(nextNum).padStart(2, '0')}`;

    const res = await db.query(
      "INSERT INTO asset_categories (id, name, description, asset_count, icon) VALUES ($1, $2, $3, 0, $4) RETURNING id, name, description, asset_count AS \"assetCount\", icon",
      [newId, name, description || null, icon]
    );
    return res.rows[0];
  },

  async findByName(name) {
    const res = await db.query(
      "SELECT id, name FROM asset_categories WHERE name = $1",
      [name]
    );
    return res.rows[0];
  },

  async findById(id) {
    const res = await db.query(
      'SELECT id, name, description, asset_count AS "assetCount", icon FROM asset_categories WHERE id = $1',
      [id]
    );
    return res.rows[0];
  },

  async update(id, data) {
    const fields = [];
    const params = [];

    ["name", "description", "icon"].forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(data, field)) {
        params.push(data[field] || null);
        fields.push(`${field} = $${params.length}`);
      }
    });

    if (fields.length === 0) {
      return this.findById(id);
    }

    params.push(id);
    const res = await db.query(
      `UPDATE asset_categories
       SET ${fields.join(", ")}
       WHERE id = $${params.length}
       RETURNING id, name, description, asset_count AS "assetCount", icon`,
      params
    );
    return res.rows[0];
  }
};

module.exports = categoryRepository;
