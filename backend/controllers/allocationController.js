const allocationService = require("../services/allocationService");

const allocationController = {
  async getAllocations(req, res, next) {
    try {
      const { page, pageSize, status, department, search } = req.query;
      const result = await allocationService.getAllocations({
        page: page ? parseInt(page, 10) : 1,
        pageSize: pageSize ? parseInt(pageSize, 10) : 10,
        status,
        department,
        search,
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async getOverdueAllocations(req, res, next) {
    try {
      const allocations = await allocationService.getOverdueAllocations();
      res.status(200).json(allocations);
    } catch (error) {
      next(error);
    }
  },

  async getAllocationById(req, res, next) {
    try {
      const allocation = await allocationService.getAllocationById(req.params.id);
      res.status(200).json(allocation);
    } catch (error) {
      next(error);
    }
  },

  async allocateAsset(req, res, next) {
    try {
      const allocation = await allocationService.allocateAsset(req.body, req.user);
      res.status(201).json(allocation);
    } catch (error) {
      next(error);
    }
  },

  async transferAsset(req, res, next) {
    try {
      const allocation = await allocationService.transferAsset(req.params.id, req.body, req.user);
      res.status(200).json(allocation);
    } catch (error) {
      next(error);
    }
  },

  async returnAsset(req, res, next) {
    try {
      const allocation = await allocationService.returnAsset(req.params.id, req.body, req.user);
      res.status(200).json(allocation);
    } catch (error) {
      next(error);
    }
  },

  async checkConflicts(req, res, next) {
    try {
      const result = await allocationService.checkConflicts(req.query);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = allocationController;
