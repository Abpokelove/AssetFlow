const departmentRepository = require("../repositories/departmentRepository");

const departmentService = {
  async getDepartments() {
    return departmentRepository.findAll();
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
  }
};

module.exports = departmentService;
