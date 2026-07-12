const categoryService = require("../services/categoryService");

const categoryController = {
  async getCategories(req, res, next) {
    try {
      const categories = await categoryService.getCategories();
      res.status(200).json(categories);
    } catch (error) {
      next(error);
    }
  },

  async createCategory(req, res, next) {
    try {
      const category = await categoryService.createCategory(req.body);
      res.status(201).json(category);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = categoryController;
