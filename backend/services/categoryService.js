const categoryRepository = require("../repositories/categoryRepository");

const categoryService = {
  async getCategories() {
    return categoryRepository.findAll();
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
  }
};

module.exports = categoryService;
