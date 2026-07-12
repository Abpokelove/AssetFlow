const db = require("../db");

const allocationSelect = `
  SELECT
    aa.id::text AS id,
    aa.asset_id AS "assetId",
    a.name AS "assetName",
    a.tag AS "assetTag",
    aa.employee_id AS "employeeId",
    e.name AS "employeeName",
    aa.department_id AS "departmentId",
    d.name AS department,
    aa.allocated_at AS "allocatedDate",
    NULL::timestamptz AS "expectedReturn",
    aa.returned_at AS "returnedDate",
    aa.allocated_by AS "allocatedById",
    allocator.name AS "allocatedBy",
    aa.condition_on_issue AS "conditionOnIssue",
    aa.condition_on_return AS "conditionOnReturn",
    aa.status,
    aa.notes
  FROM asset_allocations aa
  INNER JOIN assets a ON a.id = aa.asset_id
  LEFT JOIN employees e ON e.id = aa.employee_id
  LEFT JOIN departments d ON d.id = aa.department_id
  LEFT JOIN employees allocator ON allocator.id = aa.allocated_by
`;

const mapAllocation = (row) => row && ({
  ...row,
  status: row.status === "ACTIVE" ? "Active" : row.status === "RETURNED" ? "Returned" : "Transferred",
  employeeName: row.employeeName || row.department || null,
  allocatedBy: row.allocatedBy || "System",
});

const appendTimeline = (timeline, entry) => JSON.stringify([
  ...(Array.isArray(timeline) ? timeline : []),
  entry,
]);

const allocationRepository = {
  async findFiltered({ page = 1, pageSize = 10, status, department, search } = {}) {
    const offset = (page - 1) * pageSize;
    const params = [];
    const conditions = [];
    let query = allocationSelect;

    if (status) {
      params.push(status.toUpperCase());
      conditions.push(`aa.status = $${params.length}`);
    }

    if (department) {
      params.push(department);
      conditions.push(`d.name = $${params.length}`);
    }

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(a.name ILIKE $${params.length} OR a.tag ILIKE $${params.length} OR e.name ILIKE $${params.length} OR d.name ILIKE $${params.length})`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    const countRes = await db.query(`SELECT COUNT(*) FROM (${query}) AS filtered_allocations`, params);
    query += ` ORDER BY aa.allocated_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    const dataRes = await db.query(query, [...params, pageSize, offset]);

    return {
      data: dataRes.rows.map(mapAllocation),
      total: parseInt(countRes.rows[0].count, 10),
      page,
      pageSize,
    };
  },

  async findById(id) {
    const res = await db.query(`${allocationSelect} WHERE aa.id = $1`, [id]);
    return mapAllocation(res.rows[0]);
  },

  async findOverdue() {
    return [];
  },

  async findConflicts({ assetId }) {
    const res = await db.query(`${allocationSelect} WHERE aa.asset_id = $1 AND aa.status = 'ACTIVE'`, [assetId]);
    return res.rows.map(mapAllocation);
  },

  async allocate({ assetId, employeeId, departmentId, conditionOnIssue, notes, actor }) {
    const client = await db.pool.connect();
    try {
      await client.query("BEGIN");

      const assetRes = await client.query("SELECT * FROM assets WHERE id = $1 FOR UPDATE", [assetId]);
      const asset = assetRes.rows[0];
      if (!asset) {
        const error = new Error("Asset not found");
        error.statusCode = 404;
        throw error;
      }

      if (["Retired", "Disposed", "Lost"].includes(asset.status)) {
        const error = new Error("Asset cannot be allocated in its current status");
        error.statusCode = 409;
        throw error;
      }

      const activeRes = await client.query(
        "SELECT id FROM asset_allocations WHERE asset_id = $1 AND status = 'ACTIVE' FOR UPDATE",
        [assetId]
      );
      if (activeRes.rows.length > 0) {
        const error = new Error("Asset already has an active allocation");
        error.statusCode = 409;
        throw error;
      }

      let assigneeName = null;
      let departmentName = null;
      if (employeeId) {
        const employeeRes = await client.query("SELECT id, name, department FROM employees WHERE id = $1", [employeeId]);
        const employee = employeeRes.rows[0];
        if (!employee) {
          const error = new Error("Employee not found");
          error.statusCode = 404;
          throw error;
        }
        assigneeName = employee.name;
        departmentName = employee.department || null;
      } else {
        const departmentRes = await client.query("SELECT id, name FROM departments WHERE id = $1", [departmentId]);
        const department = departmentRes.rows[0];
        if (!department) {
          const error = new Error("Department not found");
          error.statusCode = 404;
          throw error;
        }
        assigneeName = department.name;
        departmentName = department.name;
      }

      const insertRes = await client.query(
        `INSERT INTO asset_allocations (asset_id, employee_id, department_id, allocated_by, condition_on_issue, notes)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [assetId, employeeId || null, departmentId || null, actor.id, conditionOnIssue || asset.condition, notes || null]
      );

      const timeline = appendTimeline(asset.timeline, {
        status: "Allocated",
        date: new Date().toISOString(),
        note: notes || `Allocated to ${assigneeName}`,
        by: actor.name,
      });

      await client.query(
        `UPDATE assets
         SET status = 'Allocated', assigned_to = $1, assigned_to_id = $2, department = $3, timeline = $4
         WHERE id = $5`,
        [assigneeName, employeeId || null, departmentName, timeline, assetId]
      );

      await client.query("COMMIT");
      return this.findById(insertRes.rows[0].id);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  async transfer(id, { newEmployeeId, newDepartmentId, reason, notes, actor }) {
    const client = await db.pool.connect();
    try {
      await client.query("BEGIN");

      const allocationRes = await client.query(
        "SELECT * FROM asset_allocations WHERE id = $1 AND status = 'ACTIVE' FOR UPDATE",
        [id]
      );
      const allocation = allocationRes.rows[0];
      if (!allocation) {
        const error = new Error("Active allocation not found");
        error.statusCode = 404;
        throw error;
      }

      const assetRes = await client.query("SELECT * FROM assets WHERE id = $1 FOR UPDATE", [allocation.asset_id]);
      const asset = assetRes.rows[0];

      let assigneeName = null;
      let departmentName = null;
      if (newEmployeeId) {
        if (allocation.employee_id === newEmployeeId) {
          const error = new Error("Asset is already allocated to this employee");
          error.statusCode = 409;
          throw error;
        }
        const employeeRes = await client.query("SELECT id, name, department FROM employees WHERE id = $1", [newEmployeeId]);
        const employee = employeeRes.rows[0];
        if (!employee) {
          const error = new Error("Employee not found");
          error.statusCode = 404;
          throw error;
        }
        assigneeName = employee.name;
        departmentName = employee.department || null;
      } else {
        if (allocation.department_id === newDepartmentId) {
          const error = new Error("Asset is already allocated to this department");
          error.statusCode = 409;
          throw error;
        }
        const departmentRes = await client.query("SELECT id, name FROM departments WHERE id = $1", [newDepartmentId]);
        const department = departmentRes.rows[0];
        if (!department) {
          const error = new Error("Department not found");
          error.statusCode = 404;
          throw error;
        }
        assigneeName = department.name;
        departmentName = department.name;
      }

      await client.query(
        `INSERT INTO transfer_requests (
          asset_id, current_allocation_id, requested_by, to_employee_id, to_department_id,
          reason, status, approved_by, decided_at
        ) VALUES ($1, $2, $3, $4, $5, $6, 'APPROVED', $3, CURRENT_TIMESTAMP)`,
        [allocation.asset_id, id, actor.id, newEmployeeId || null, newDepartmentId || null, reason || null]
      );

      await client.query(
        "UPDATE asset_allocations SET status = 'TRANSFERRED', returned_at = CURRENT_TIMESTAMP WHERE id = $1",
        [id]
      );

      const newAllocationRes = await client.query(
        `INSERT INTO asset_allocations (asset_id, employee_id, department_id, allocated_by, condition_on_issue, notes)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [allocation.asset_id, newEmployeeId || null, newDepartmentId || null, actor.id, asset.condition, notes || reason || null]
      );

      const timeline = appendTimeline(asset.timeline, {
        status: "Allocated",
        date: new Date().toISOString(),
        note: notes || reason || `Transferred to ${assigneeName}`,
        by: actor.name,
      });

      await client.query(
        `UPDATE assets
         SET status = 'Allocated', assigned_to = $1, assigned_to_id = $2, department = $3, timeline = $4
         WHERE id = $5`,
        [assigneeName, newEmployeeId || null, departmentName, timeline, allocation.asset_id]
      );

      await client.query("COMMIT");
      return this.findById(newAllocationRes.rows[0].id);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  async returnAllocation(id, { condition, notes, returnedDate, actor }) {
    const client = await db.pool.connect();
    try {
      await client.query("BEGIN");

      const allocationRes = await client.query(
        "SELECT * FROM asset_allocations WHERE id = $1 AND status = 'ACTIVE' FOR UPDATE",
        [id]
      );
      const allocation = allocationRes.rows[0];
      if (!allocation) {
        const error = new Error("Active allocation not found");
        error.statusCode = 404;
        throw error;
      }

      const assetRes = await client.query("SELECT * FROM assets WHERE id = $1 FOR UPDATE", [allocation.asset_id]);
      const asset = assetRes.rows[0];
      const returnedAt = returnedDate || new Date().toISOString();

      await client.query(
        `UPDATE asset_allocations
         SET status = 'RETURNED', returned_at = $1, condition_on_return = $2, notes = COALESCE($3, notes)
         WHERE id = $4`,
        [returnedAt, condition || asset.condition, notes || null, id]
      );

      const timeline = appendTimeline(asset.timeline, {
        status: "Available",
        date: new Date().toISOString(),
        note: notes || "Asset returned",
        by: actor.name,
      });

      await client.query(
        `UPDATE assets
         SET status = 'Available', assigned_to = NULL, assigned_to_id = NULL, condition = COALESCE($1, condition), timeline = $2
         WHERE id = $3`,
        [condition || null, timeline, allocation.asset_id]
      );

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

module.exports = allocationRepository;
