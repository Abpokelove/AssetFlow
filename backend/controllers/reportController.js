const reportService = require("../services/reportService");

const reportController = {
  async getSummary(req, res, next) {
    try {
      res.status(200).json(await reportService.getSummary());
    } catch (error) {
      next(error);
    }
  },

  async getAssetsByStatus(req, res, next) {
    try {
      res.status(200).json(await reportService.getAssetsByStatus());
    } catch (error) {
      next(error);
    }
  },

  async getAssetsByCategory(req, res, next) {
    try {
      res.status(200).json(await reportService.getAssetsByCategory());
    } catch (error) {
      next(error);
    }
  },

  async getMonthlyActivity(req, res, next) {
    try {
      res.status(200).json(await reportService.getMonthlyActivity(req.query.months));
    } catch (error) {
      next(error);
    }
  },

  async getDepartmentUtilization(req, res, next) {
    try {
      res.status(200).json(await reportService.getDepartmentUtilization());
    } catch (error) {
      next(error);
    }
  },

  async getDepreciationReport(req, res, next) {
    try {
      res.status(200).json(await reportService.getDepreciationReport(req.query.year));
    } catch (error) {
      next(error);
    }
  },
};

module.exports = reportController;
