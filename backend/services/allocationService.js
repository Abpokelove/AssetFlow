const allocationRepository = require("../repositories/allocationRepository");

const assertOneTarget = ({ employeeId, departmentId }, employeeField = "employeeId", departmentField = "departmentId") => {
  const hasEmployee = Boolean(employeeId);
  const hasDepartment = Boolean(departmentId);

  if (hasEmployee === hasDepartment) {
    const error = new Error(`Provide exactly one of ${employeeField} or ${departmentField}`);
    error.statusCode = 400;
    throw error;
  }
};

const getActor = (user = {}) => ({
  id: user.id,
  name: user.name || "System",
});

const allocationService = {
  async getAllocations(params) {
    return allocationRepository.findFiltered(params);
  },

  async getAllocationById(id) {
    const allocation = await allocationRepository.findById(id);
    if (!allocation) {
      const error = new Error("Allocation not found");
      error.statusCode = 404;
      throw error;
    }
    return allocation;
  },

  async allocateAsset(data, user) {
    assertOneTarget(data);

    if (!data.assetId) {
      const error = new Error("Asset is required");
      error.statusCode = 400;
      throw error;
    }

    const conflicts = await allocationRepository.findConflicts({ assetId: data.assetId });
    if (conflicts.length > 0) {
      const error = new Error("Asset already has an active allocation");
      error.statusCode = 409;
      throw error;
    }

    return allocationRepository.allocate({
      assetId: data.assetId,
      employeeId: data.employeeId,
      departmentId: data.departmentId,
      conditionOnIssue: data.conditionOnIssue,
      notes: data.notes,
      actor: getActor(user),
    });
  },

  async transferAsset(id, data, user) {
    const normalized = {
      newEmployeeId: data.newEmployeeId,
      newDepartmentId: data.newDepartmentId,
      employeeId: data.newEmployeeId,
      departmentId: data.newDepartmentId,
    };
    assertOneTarget(normalized, "newEmployeeId", "newDepartmentId");

    return allocationRepository.transfer(id, {
      newEmployeeId: data.newEmployeeId,
      newDepartmentId: data.newDepartmentId,
      reason: data.reason,
      notes: data.notes,
      actor: getActor(user),
    });
  },

  async returnAsset(id, data, user) {
    return allocationRepository.returnAllocation(id, {
      condition: data.condition,
      notes: data.notes,
      returnedDate: data.returnedDate,
      actor: getActor(user),
    });
  },

  async checkConflicts(params) {
    if (!params.assetId) {
      const error = new Error("Asset is required");
      error.statusCode = 400;
      throw error;
    }

    const conflictingAllocations = await allocationRepository.findConflicts(params);
    return {
      hasConflict: conflictingAllocations.length > 0,
      conflictingAllocations,
    };
  },

  async getOverdueAllocations() {
    return allocationRepository.findOverdue();
  },
};

module.exports = allocationService;
