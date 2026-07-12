const db = require("../db");

const categoryRepository = {
  async findAll() {
    const res = await db.query(
      'SELECT id, name, description, asset_count AS "assetCount", icon FROM asset_categories ORDER BY id ASC'
    );
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
  }
};

module.exports = categoryRepository;
