const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("http");
const app = require("./app");
const db = require("./db");
const jwt = require("jsonwebtoken");

let server;
let port;
let baseUrl;
let authToken;

// In-memory data store for fallback mock mode
const mockStore = {
  departments: [
    { id: "dept-01", name: "IT Operations", headCount: 24, assetCount: 87, manager: "James Torres" }
  ],
  categories: [
    { id: "cat-01", name: "IT Equipment", description: "Laptops, desktops", assetCount: 185, icon: "Monitor" }
  ],
  employees: [
    { id: "emp-001", name: "Sarah Mitchell", email: "sarah.m@acme.com", department: "IT Operations", role: "Asset Manager", status: "Active", joinDate: "2021-03-15", allocatedAssets: 3 }
  ],
  assets: [
    { id: "ast-001", tag: "AF-LAPT-0001", name: "Dell XPS 15 Laptop", category: "IT Equipment", status: "Available", condition: "Good", department: "IT Operations", purchaseDate: "2022-03-10", purchaseValue: 1800 }
  ]
};

test.before(async () => {
  // Start server on random port
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  port = server.address().port;
  baseUrl = `http://localhost:${port}/api`;

  // Generate a test JWT token for authorization
  const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
  authToken = jwt.sign(
    { id: "emp-001", name: "Sarah Mitchell", email: "sarah.m@acme.com", role: "Asset Manager" },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  // Connection check
  try {
    await db.query("SELECT 1");
    console.log("PostgreSQL detected. Running live DB integration tests.");
  } catch (err) {
    console.log("PostgreSQL not detected. Overriding query module for Mock DB Mode tests.");
    
    // Mock db.query
    db.query = async (text, params) => {
      const sql = text.replace(/\s+/g, " ").trim().toLowerCase();
      
      // Check specific queries with WHERE clause first to avoid general matching
      if (sql.includes("where name = $1") && sql.includes("departments")) {
        const found = mockStore.departments.find(d => d.name.toLowerCase() === params[0].toLowerCase());
        return { rows: found ? [found] : [] };
      }
      if (sql.includes("where name = $1") && sql.includes("asset_categories")) {
        const found = mockStore.categories.find(c => c.name.toLowerCase() === params[0].toLowerCase());
        return { rows: found ? [found] : [] };
      }
      if (sql.includes("where tag = $1")) {
        const found = mockStore.assets.find(a => a.tag === params[0]);
        return { rows: found ? [found] : [] };
      }
      if (sql.includes("where serial_number = $1")) {
        const found = mockStore.assets.find(a => a.serialNumber === params[0]);
        return { rows: found ? [found] : [] };
      }
      if (sql.includes("where email = $1")) {
        const found = mockStore.employees.find(e => e.email === params[0]);
        return { rows: found ? [found] : [] };
      }
      if (sql.includes("from employees") && sql.includes("where id = $1")) {
        const found = mockStore.employees.find(e => e.id === params[0]);
        return { rows: found ? [found] : [] };
      }
      if (sql.includes("from assets") && sql.includes("where id = $1")) {
        const found = mockStore.assets.find(a => a.id === params[0]);
        return { rows: found ? [found] : [] };
      }

      // General query matches
      if (sql.includes("select id, name, head_count")) {
        return { rows: mockStore.departments };
      }
      if (sql.includes("select id, name, description, asset_count")) {
        return { rows: mockStore.categories };
      }
      if (sql.includes("select id from departments")) {
        return { rows: mockStore.departments.map(d => ({ id: d.id })) };
      }
      if (sql.includes("select id from asset_categories")) {
        return { rows: mockStore.categories.map(c => ({ id: c.id })) };
      }
      if (sql.includes("select id from employees")) {
        return { rows: mockStore.employees.map(e => ({ id: e.id })) };
      }
      if (sql.includes("select id from assets")) {
        return { rows: mockStore.assets.map(a => ({ id: a.id })) };
      }
      
      // General lists
      if (sql.includes("from employees")) {
        return { rows: mockStore.employees };
      }
      if (sql.includes("from assets")) {
        return { rows: mockStore.assets };
      }

      // Inserts
      if (sql.includes("insert into departments")) {
        const [id, name, manager] = params;
        const newDept = { id, name, headCount: 0, assetCount: 0, manager };
        mockStore.departments.push(newDept);
        return { rows: [newDept] };
      }
      if (sql.includes("insert into asset_categories")) {
        const [id, name, description, icon] = params;
        const newCat = { id, name, description, assetCount: 0, icon };
        mockStore.categories.push(newCat);
        return { rows: [newCat] };
      }
      
      return { rows: [] };
    };

    // Mock db.pool.connect
    db.pool = {
      connect: async () => {
        return {
          query: async (text, params) => {
            const sql = text.replace(/\s+/g, " ").trim().toLowerCase();
            
            if (sql.includes("insert into employees")) {
              const [id, name, email, , department, role, status] = params;
              const newEmp = { id, name, email, department, role, status, joinDate: new Date().toISOString(), allocatedAssets: 0 };
              mockStore.employees.push(newEmp);
              return { rows: [newEmp] };
            }
            if (sql.includes("insert into assets")) {
              const [id, tag, name, category, status, condition, department, assignedTo, assignedToId, purchaseDate, purchaseValue, currentValue, location, serialNumber, description, warrantyExpiry, timeline] = params;
              const newAsset = { id, tag, name, category, status, condition, department, assignedTo, assignedToId, purchaseDate, purchaseValue, currentValue, location, serialNumber, description, warrantyExpiry, registeredDate: new Date().toISOString(), timeline };
              mockStore.assets.push(newAsset);
              return { rows: [newAsset] };
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

test.after(() => {
  server.close();
});

test("GET /api/departments returns departments list", async () => {
  const res = await fetch(`${baseUrl}/departments`, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(Array.isArray(data));
  assert.ok(data.length > 0);
  assert.equal(data[0].id, "dept-01");
});

test("POST /api/departments creates new department", async () => {
  const payload = { name: "Product Design", manager: "Jane Doe" };
  const res = await fetch(`${baseUrl}/departments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`
    },
    body: JSON.stringify(payload)
  });
  
  assert.equal(res.status, 201);
  const data = await res.json();
  assert.equal(data.name, "Product Design");
  assert.equal(data.manager, "Jane Doe");
  assert.ok(data.id.startsWith("dept-"));
});

test("GET /api/categories returns categories list", async () => {
  const res = await fetch(`${baseUrl}/categories`, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(Array.isArray(data));
  assert.equal(data[0].id, "cat-01");
});

test("POST /api/categories creates new category", async () => {
  const payload = { name: "Network Gear", description: "Routers and switches" };
  const res = await fetch(`${baseUrl}/categories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`
    },
    body: JSON.stringify(payload)
  });

  assert.equal(res.status, 201);
  const data = await res.json();
  assert.equal(data.name, "Network Gear");
  assert.equal(data.description, "Routers and switches");
});

test("POST /api/employees creates new employee", async () => {
  const payload = {
    name: "John Doe",
    email: "john.d@acme.com",
    department: "Engineering",
    role: "Software Engineer"
  };
  const res = await fetch(`${baseUrl}/employees`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`
    },
    body: JSON.stringify(payload)
  });

  assert.equal(res.status, 201);
  const data = await res.json();
  assert.equal(data.name, "John Doe");
  assert.equal(data.email, "john.d@acme.com");
  assert.ok(data.id.startsWith("emp-"));
});

test("POST /api/assets registers new asset", async () => {
  const payload = {
    tag: "AF-LAPT-0005",
    name: "MacBook Pro M3",
    category: "IT Equipment",
    condition: "Excellent",
    purchaseDate: "2024-05-01",
    purchaseValue: 2400.00,
    location: "IT Store Room",
    serialNumber: "APL-MBP-88210",
    description: "16-inch, M3 Pro, 36GB RAM"
  };
  const res = await fetch(`${baseUrl}/assets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`
    },
    body: JSON.stringify(payload)
  });

  assert.equal(res.status, 201);
  const data = await res.json();
  assert.equal(data.tag, "AF-LAPT-0005");
  assert.equal(data.name, "MacBook Pro M3");
  assert.equal(data.status, "Available");
  assert.ok(data.id.startsWith("ast-"));
});
