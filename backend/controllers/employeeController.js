const employeeService = require("../services/employeeService");

const employeeController = {
  async getEmployees(req, res, next) {
    try {
      const { page, pageSize, department, status, search } = req.query;
      const result = await employeeService.getEmployees({
        page: page ? parseInt(page, 10) : 1,
        pageSize: pageSize ? parseInt(pageSize, 10) : 10,
        department,
        status,
        search
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async getEmployeeById(req, res, next) {
    try {
      const employee = await employeeService.getEmployeeById(req.params.id);
      res.status(200).json(employee);
    } catch (error) {
      next(error);
    }
  },

  async updateEmployee(req, res, next) {
    try {
      const employee = await employeeService.updateEmployee(req.params.id, req.body);
      res.status(200).json(employee);
    } catch (error) {
      next(error);
    }
  },

  async updateEmployeeStatus(req, res, next) {
    try {
      const employee = await employeeService.updateEmployeeStatus(req.params.id, req.body);
      res.status(200).json(employee);
    } catch (error) {
      next(error);
    }
  },

  async createEmployee(req, res, next) {
    try {
      const employee = await employeeService.createEmployee(req.body);
      res.status(201).json(employee);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = employeeController;
