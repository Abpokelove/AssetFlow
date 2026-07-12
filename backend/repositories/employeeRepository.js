const db = require("../db");

const employeeRepository = {
  async findFiltered({ department, status, search, page = 1, pageSize = 10 }) {
    const offset = (page - 1) * pageSize;
    const params = [];
    const conditions = [];

    let query = `
      SELECT 
        id, 
        name, 
        email, 
        department, 
        role, 
        status, 
        join_date AS "joinDate", 
        allocated_assets AS "allocatedAssets"
      FROM employees
    `;

    if (department) {
      params.push(department);
      conditions.push(`department = $${params.length}`);
    }

    if (status) {
      params.push(status);
      conditions.push(`status = $${params.length}`);
    }

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(name ILIKE $${params.length} OR email ILIKE $${params.length})`);
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
    };
  },

  async findById(id) {
    const res = await db.query(
      `SELECT id, name, email, department, role, status, join_date AS "joinDate", allocated_assets AS "allocatedAssets"
       FROM employees WHERE id = $1`,
      [id]
    );
    return res.rows[0];
  },

  async findByEmail(email) {
    const res = await db.query(
      `SELECT id, name, email, password_hash AS "passwordHash", department, role, status, join_date AS "joinDate", allocated_assets AS "allocatedAssets"
       FROM employees WHERE email = $1`,
      [email]
    );
    return res.rows[0];
  },

  async findRolesByEmployeeId(employeeId) {
    const res = await db.query(
      `SELECT r.name
       FROM roles r
       INNER JOIN employee_roles er ON er.role_id = r.id
       WHERE er.employee_id = $1
       ORDER BY r.name`,
      [employeeId]
    );
    return res.rows.map((row) => row.name);
  },

  async update(id, data) {
    const fieldMap = {
      name: "name",
      email: "email",
      department: "department",
      role: "role",
      status: "status",
      allocatedAssets: "allocated_assets",
    };
    const fields = [];
    const params = [];

    Object.entries(fieldMap).forEach(([key, column]) => {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        params.push(data[key]);
        fields.push(`${column} = $${params.length}`);
      }
    });

    if (fields.length === 0) {
      return this.findById(id);
    }

    params.push(id);
    const res = await db.query(
      `UPDATE employees
       SET ${fields.join(", ")}
       WHERE id = $${params.length}
       RETURNING id, name, email, department, role, status, join_date AS "joinDate", allocated_assets AS "allocatedAssets"`,
      params
    );
    return res.rows[0];
  },

  async create({ name, email, passwordHash, department, role = "Employee", status = "Active" }) {
    // Generate ID in format emp-XXX
    const idRes = await db.query("SELECT id FROM employees WHERE id LIKE 'emp-%'");
    let nextNum = 1;
    if (idRes.rows.length > 0) {
      const nums = idRes.rows.map(r => parseInt(r.id.split("-")[1], 10)).filter(n => !isNaN(n));
      if (nums.length > 0) {
        nextNum = Math.max(...nums) + 1;
      }
    }
    const newId = `emp-${String(nextNum).padStart(3, '0')}`;

    // Start transaction to insert employee and assign role
    const client = await db.pool.connect();
    try {
      await client.query("BEGIN");
      
      const employeeRes = await client.query(
        `INSERT INTO employees (id, name, email, password_hash, department, role, status, join_date, allocated_assets)
         VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_DATE, 0)
         RETURNING id, name, email, department, role, status, join_date AS "joinDate", allocated_assets AS "allocatedAssets"`,
        [newId, name, email, passwordHash, department || null, role, status]
      );

      // Find role_id or assign standard role_id
      let roleName = "EMPLOYEE";
      if (role && ["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD", "EMPLOYEE"].includes(role.toUpperCase().replace(" ", "_"))) {
        roleName = role.toUpperCase().replace(" ", "_");
      }
      
      const roleRes = await client.query("SELECT id FROM roles WHERE name = $1", [roleName]);
      if (roleRes.rows.length > 0) {
        await client.query(
          "INSERT INTO employee_roles (employee_id, role_id) VALUES ($1, $2)",
          [newId, roleRes.rows[0].id]
        );
      }

      // Also increment headCount in department if department is set
      if (department) {
        await client.query(
          "UPDATE departments SET head_count = head_count + 1 WHERE name = $1",
          [department]
        );
      }

      await client.query("COMMIT");
      return employeeRes.rows[0];
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }
};

module.exports = employeeRepository;
