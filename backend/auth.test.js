const test = require('node:test');
const assert = require('node:assert/strict');
const { registerUser, loginUser } = require('./auth');
const db = require('./db');

const mockStore = {
  employees: [],
  roles: [{ id: 4, name: 'EMPLOYEE' }],
  employee_roles: []
};

test.before(async () => {
  try {
    await db.query("SELECT 1");
  } catch (err) {
    // Override db.query and db.pool for testing without running DB
    db.query = async (text, params) => {
      const sql = text.replace(/\s+/g, " ").trim().toLowerCase();
      if (sql.includes("select id from employees")) {
        return { rows: mockStore.employees.map(e => ({ id: e.id })) };
      }
      if (sql.includes("select id, name, email")) {
        const found = mockStore.employees.find(e => e.email === params[0]);
        return { rows: found ? [found] : [] };
      }
      return { rows: [] };
    };

    db.pool = {
      connect: async () => {
        return {
          query: async (text, params) => {
            const sql = text.replace(/\s+/g, " ").trim().toLowerCase();
            if (sql.includes("insert into employees")) {
              const [id, name, email, password_hash, department, role, status] = params;
              const newEmp = { id, name, email, passwordHash: password_hash, department, role, status };
              mockStore.employees.push(newEmp);
              return { rows: [newEmp] };
            }
            if (sql.includes("select id from roles")) {
              return { rows: [{ id: 4 }] };
            }
            return { rows: [] };
          },
          release: () => {}
        };
      }
    };
  }
});

test('register and login flow works', async () => {
  const user = await registerUser({
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
  });

  assert.equal(user.email, 'test@example.com');

  const result = await loginUser({
    email: 'test@example.com',
    password: 'password123',
  });

  assert.ok(result.token);
  assert.equal(result.user.email, 'test@example.com');
});
