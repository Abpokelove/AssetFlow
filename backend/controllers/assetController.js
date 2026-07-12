const assetService = require("../services/assetService");

const assetController = {
  async getAssets(req, res, next) {
    try {
      const { page, pageSize, status, category, department, search } = req.query;
      const result = await assetService.getAssets({
        page: page ? parseInt(page, 10) : 1,
        pageSize: pageSize ? parseInt(pageSize, 10) : 10,
        status,
        category,
        department,
        search
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async getAssetById(req, res, next) {
    try {
      const asset = await assetService.getAssetById(req.params.id);
      res.status(200).json(asset);
    } catch (error) {
      next(error);
    }
  },

  async updateAsset(req, res, next) {
    try {
      const updaterName = req.user ? req.user.name : "System";
      const asset = await assetService.updateAsset(req.params.id, req.body, updaterName);
      res.status(200).json(asset);
    } catch (error) {
      next(error);
    }
  },

  async updateAssetStatus(req, res, next) {
    try {
      const updaterName = req.user ? req.user.name : "System";
      const asset = await assetService.updateAssetStatus(req.params.id, req.body, updaterName);
      res.status(200).json(asset);
    } catch (error) {
      next(error);
    }
  },

  async getAssetTimeline(req, res, next) {
    try {
      const timeline = await assetService.getAssetTimeline(req.params.id);
      res.status(200).json(timeline);
    } catch (error) {
      next(error);
    }
  },

  async retireAsset(req, res, next) {
    try {
      const updaterName = req.user ? req.user.name : "System";
      const asset = await assetService.retireAsset(req.params.id, req.body, updaterName);
      res.status(200).json(asset);
    } catch (error) {
      next(error);
    }
  },

  async disposeAsset(req, res, next) {
    try {
      const updaterName = req.user ? req.user.name : "System";
      const asset = await assetService.disposeAsset(req.params.id, req.body, updaterName);
      res.status(200).json(asset);
    } catch (error) {
      next(error);
    }
  },

  async deleteAsset(req, res, next) {
    try {
      await assetService.deleteAsset(req.params.id);
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  },

  async createAsset(req, res, next) {
    try {
      const creatorName = req.user ? req.user.name : "System";
      const asset = await assetService.createAsset(req.body, creatorName);
      res.status(201).json(asset);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = assetController;
