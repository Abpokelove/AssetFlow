const departmentRepository = require("../repositories/departmentRepository");

const departmentService = {
  async getDepartments(params = {}) {
    return departmentRepository.findAll(params);
  },

  async getDepartmentById(id) {
    const department = await departmentRepository.findById(id);
    if (!department) {
      const error = new Error("Department not found");
      error.statusCode = 404;
      throw error;
    }
    return department;
  },

  async createDepartment({ name, manager }) {
    if (!name || name.trim() === "") {
      const error = new Error("Department name is required");
      error.statusCode = 400;
      throw error;
    }

    const existing = await departmentRepository.findByName(name.trim());
    if (existing) {
      const error = new Error("Department with this name already exists");
      error.statusCode = 409;
      throw error;
    }

    return departmentRepository.create({
      name: name.trim(),
      manager: manager ? manager.trim() : null
    });
  },

  async updateDepartment(id, { name, manager }) {
    await this.getDepartmentById(id);
    const updates = {};

    if (Object.prototype.hasOwnProperty.call(arguments[1] || {}, "name")) {
      if (!name || name.trim() === "") {
        const error = new Error("Department name is required");
        error.statusCode = 400;
        throw error;
      }

      const existing = await departmentRepository.findByName(name.trim());
      if (existing && existing.id !== id) {
        const error = new Error("Department with this name already exists");
        error.statusCode = 409;
        throw error;
      }
      updates.name = name.trim();
    }

    if (Object.prototype.hasOwnProperty.call(arguments[1] || {}, "manager")) {
      updates.manager = manager ? manager.trim() : null;
    }

    return departmentRepository.update(id, updates);
  }
};

module.exports = departmentService;
