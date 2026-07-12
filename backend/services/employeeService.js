const employeeRepository = require("../repositories/employeeRepository");
const bcrypt = require("bcryptjs");

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
