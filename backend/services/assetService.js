const assetRepository = require("../repositories/assetRepository");

const VALID_ASSET_STATUSES = new Set([
  "Available",
  "Allocated",
  "Reserved",
  "Under Maintenance",
  "Lost",
  "Retired",
  "Disposed",
  "Pending Approval",
]);

const VALID_ASSET_CONDITIONS = new Set(["Excellent", "Good", "Fair", "Poor"]);

const cleanString = (value) => (typeof value === "string" ? value.trim() : value);

const assertValidStatus = (status) => {
  if (!VALID_ASSET_STATUSES.has(status)) {
    const error = new Error("Invalid asset status");
    error.statusCode = 400;
    throw error;
  }
};

const assertValidCondition = (condition) => {
  if (!VALID_ASSET_CONDITIONS.has(condition)) {
    const error = new Error("Invalid asset condition");
    error.statusCode = 400;
    throw error;
  }
};

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

  async updateAsset(id, data, updaterName = "System") {
    const existing = await this.getAssetById(id);
    const updates = {};

    [
      "tag",
      "name",
      "category",
      "condition",
      "department",
      "assignedTo",
      "assignedToId",
      "purchaseDate",
      "purchaseValue",
      "currentValue",
      "location",
      "serialNumber",
      "description",
      "warrantyExpiry",
      "lastAuditDate",
    ].forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(data, field)) {
        updates[field] = cleanString(data[field]);
      }
    });

    if (Object.prototype.hasOwnProperty.call(data, "status")) {
      updates.status = cleanString(data.status);
      assertValidStatus(updates.status);
    }

    if (Object.prototype.hasOwnProperty.call(updates, "condition")) {
      assertValidCondition(updates.condition);
    }

    if (Object.prototype.hasOwnProperty.call(updates, "tag")) {
      if (!updates.tag) {
        const error = new Error("Asset tag is required");
        error.statusCode = 400;
        throw error;
      }
      const duplicate = await assetRepository.findByTag(updates.tag);
      if (duplicate && duplicate.id !== id) {
        const error = new Error(`Asset tag '${updates.tag}' is already in use`);
        error.statusCode = 409;
        throw error;
      }
    }

    if (Object.prototype.hasOwnProperty.call(updates, "name") && !updates.name) {
      const error = new Error("Asset name is required");
      error.statusCode = 400;
      throw error;
    }

    if (Object.prototype.hasOwnProperty.call(updates, "category") && !updates.category) {
      const error = new Error("Asset category is required");
      error.statusCode = 400;
      throw error;
    }

    if (Object.prototype.hasOwnProperty.call(updates, "serialNumber") && updates.serialNumber) {
      const duplicate = await assetRepository.findBySerialNumber(updates.serialNumber);
      if (duplicate && duplicate.id !== id) {
        const error = new Error(`Serial number '${updates.serialNumber}' is already in use`);
        error.statusCode = 409;
        throw error;
      }
    }

    ["purchaseValue", "currentValue"].forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(updates, field)) {
        const value = parseFloat(updates[field]);
        if (Number.isNaN(value) || value < 0) {
          const error = new Error(`${field} cannot be negative`);
          error.statusCode = 400;
          throw error;
        }
        updates[field] = value;
      }
    });

    if (updates.status && updates.status !== existing.status) {
      updates.timeline = [
        ...(Array.isArray(existing.timeline) ? existing.timeline : []),
        {
          status: updates.status,
          date: new Date().toISOString(),
          note: data.note || `Status changed from ${existing.status} to ${updates.status}`,
          by: updaterName,
        },
      ];
    }

    return assetRepository.update(id, updates);
  },

  async updateAssetStatus(id, { status, note }, updaterName = "System") {
    return this.updateAsset(id, { status, note }, updaterName);
  },

  async getAssetTimeline(id) {
    const asset = await this.getAssetById(id);
    return Array.isArray(asset.timeline) ? asset.timeline : [];
  },

  async retireAsset(id, { reason } = {}, updaterName = "System") {
    return this.updateAssetStatus(id, {
      status: "Retired",
      note: reason || "Asset retired",
    }, updaterName);
  },

  async disposeAsset(id, { reason } = {}, updaterName = "System") {
    return this.updateAssetStatus(id, {
      status: "Disposed",
      note: reason || "Asset disposed",
    }, updaterName);
  },

  async deleteAsset(id) {
    await this.getAssetById(id);
    await assetRepository.delete(id);
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
