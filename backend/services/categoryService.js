const categoryRepository = require("../repositories/categoryRepository");

const categoryService = {
  async getCategories(params = {}) {
    return categoryRepository.findAll(params);
  },

  async getCategoryById(id) {
    const category = await categoryRepository.findById(id);
    if (!category) {
      const error = new Error("Category not found");
      error.statusCode = 404;
      throw error;
    }
    return category;
  },

  async createCategory({ name, description, icon }) {
    if (!name || name.trim() === "") {
      const error = new Error("Category name is required");
      error.statusCode = 400;
      throw error;
    }

    const existing = await categoryRepository.findByName(name.trim());
    if (existing) {
      const error = new Error("Category with this name already exists");
      error.statusCode = 409;
      throw error;
    }

    return categoryRepository.create({
      name: name.trim(),
      description: description ? description.trim() : null,
      icon: icon ? icon.trim() : "Monitor"
    });
  },

  async updateCategory(id, data = {}) {
    await this.getCategoryById(id);
    const updates = {};
    const { name, description, icon } = data;

    if (Object.prototype.hasOwnProperty.call(data, "name")) {
      if (!name || name.trim() === "") {
        const error = new Error("Category name is required");
        error.statusCode = 400;
        throw error;
      }

      const existing = await categoryRepository.findByName(name.trim());
      if (existing && existing.id !== id) {
        const error = new Error("Category with this name already exists");
        error.statusCode = 409;
        throw error;
      }
      updates.name = name.trim();
    }

    if (Object.prototype.hasOwnProperty.call(data, "description")) {
      updates.description = description ? description.trim() : null;
    }

    if (Object.prototype.hasOwnProperty.call(data, "icon")) {
      updates.icon = icon ? icon.trim() : "Monitor";
    }

    return categoryRepository.update(id, updates);
  }
};

module.exports = categoryService;
