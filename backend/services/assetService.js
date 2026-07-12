const assetRepository = require("../repositories/assetRepository");

const assetService = {
  async getAssets(params) {
    return assetRepository.findFiltered(params);
  },

  async getAssetById(id) {
    const asset = await assetRepository.findById(id);
    if (!asset) {
      const error = new Error("Asset not found");
      error.statusCode = 404;
      throw error;
    }
    return asset;
  },

  async createAsset(data, creatorName = "System") {
    const { tag, name, category, purchaseDate, purchaseValue, serialNumber } = data;

    if (!tag || tag.trim() === "") {
      const error = new Error("Asset tag is required");
      error.statusCode = 400;
      throw error;
    }

    if (!name || name.trim() === "") {
      const error = new Error("Asset name is required");
      error.statusCode = 400;
      throw error;
    }

    if (!category || category.trim() === "") {
      const error = new Error("Asset category is required");
      error.statusCode = 400;
      throw error;
    }

    if (!purchaseDate) {
      const error = new Error("Purchase date is required");
      error.statusCode = 400;
      throw error;
    }

    const value = parseFloat(purchaseValue);
    if (isNaN(value) || value < 0) {
      const error = new Error("Purchase value cannot be negative");
      error.statusCode = 400;
      throw error;
    }

    // Check unique tag
    const existingTag = await assetRepository.findByTag(tag.trim());
    if (existingTag) {
      const error = new Error(`Asset tag '${tag.trim()}' is already in use`);
      error.statusCode = 409;
      throw error;
    }

    // Check unique serial number if provided
    if (serialNumber && serialNumber.trim() !== "") {
      const existingSerial = await assetRepository.findBySerialNumber(serialNumber.trim());
      if (existingSerial) {
        const error = new Error(`Serial number '${serialNumber.trim()}' is already in use`);
        error.statusCode = 409;
        throw error;
      }
    }

    // Create initial timeline
    const timeline = [
      {
        status: "Registered",
        date: new Date().toISOString(),
        note: "Asset added to inventory",
        by: creatorName
      },
      {
        status: "Available",
        date: new Date().toISOString(),
        note: "Ready for allocation",
        by: "System"
      }
    ];

    return assetRepository.create({
      ...data,
      tag: tag.trim(),
      name: name.trim(),
      category: category.trim(),
      purchaseValue: value,
      currentValue: value,
      serialNumber: serialNumber ? serialNumber.trim() : null,
      timeline
    });
  }
};

module.exports = assetService;
