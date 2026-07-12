const employeeRepository = require("../repositories/employeeRepository");
const bcrypt = require("bcryptjs");

const VALID_EMPLOYEE_STATUSES = new Set(["Active", "Inactive", "On Leave", "Terminated"]);

const employeeService = {
  async getEmployees(params) {
    return employeeRepository.findFiltered(params);
  },

  async getEmployeeById(id) {
    const emp = await employeeRepository.findById(id);
    if (!emp) {
      const error = new Error("Employee not found");
      error.statusCode = 404;
      throw error;
    }
    return emp;
  },

  async updateEmployee(id, data = {}) {
    await this.getEmployeeById(id);
    const updates = {};

    if (Object.prototype.hasOwnProperty.call(data, "name")) {
      if (!data.name || data.name.trim() === "") {
        const error = new Error("Name is required");
        error.statusCode = 400;
        throw error;
      }
      updates.name = data.name.trim();
    }

    if (Object.prototype.hasOwnProperty.call(data, "email")) {
      if (!data.email || data.email.trim() === "") {
        const error = new Error("Email is required");
        error.statusCode = 400;
        throw error;
      }

      const email = data.email.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        const error = new Error("Invalid email format");
        error.statusCode = 400;
        throw error;
      }

      const existing = await employeeRepository.findByEmail(email);
      if (existing && existing.id !== id) {
        const error = new Error("Email is already registered");
        error.statusCode = 409;
        throw error;
      }
      updates.email = email;
    }

    if (Object.prototype.hasOwnProperty.call(data, "department")) {
      updates.department = data.department || null;
    }

    if (Object.prototype.hasOwnProperty.call(data, "role")) {
      updates.role = data.role || "Employee";
    }

    if (Object.prototype.hasOwnProperty.call(data, "status")) {
      if (!VALID_EMPLOYEE_STATUSES.has(data.status)) {
        const error = new Error("Invalid employee status");
        error.statusCode = 400;
        throw error;
      }
      updates.status = data.status;
    }

    return employeeRepository.update(id, updates);
  },

  async updateEmployeeStatus(id, { status }) {
    return this.updateEmployee(id, { status });
  },

  async createEmployee({ name, email, department, role, password }) {
    if (!name || name.trim() === "") {
      const error = new Error("Name is required");
      error.statusCode = 400;
      throw error;
    }

    if (!email || email.trim() === "") {
      const error = new Error("Email is required");
      error.statusCode = 400;
      throw error;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      const error = new Error("Invalid email format");
      error.statusCode = 400;
      throw error;
    }

    const existing = await employeeRepository.findByEmail(email.trim().toLowerCase());
    if (existing) {
      const error = new Error("Email is already registered");
      error.statusCode = 409;
      throw error;
    }

    // Hash password (default: password123)
    const rawPassword = password || "password123";
    const passwordHash = await bcrypt.hash(rawPassword, 10);

    return employeeRepository.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      department: department || null,
      role: role || "Employee"
    });
  }
};

module.exports = employeeService;
