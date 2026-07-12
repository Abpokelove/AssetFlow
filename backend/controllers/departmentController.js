const departmentService = require("../services/departmentService");

const departmentController = {
  async getDepartments(req, res, next) {
    try {
      const departments = await departmentService.getDepartments();
      res.status(200).json(departments);
    } catch (error) {
      next(error);
    }
  },

  async createDepartment(req, res, next) {
    try {
      const department = await departmentService.createDepartment(req.body);
      res.status(201).json(department);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = departmentController;
