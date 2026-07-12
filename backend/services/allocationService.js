const dashboardRepository = require("../repositories/dashboardRepository");

const toDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const toIsoDate = (value) => {
  const date = toDate(value);
  return date ? date.toISOString().slice(0, 10) : null;
};

const getTimeline = (asset) => (Array.isArray(asset.timeline) ? asset.timeline : []);

const getAllocationEvent = (asset) =>
  [...getTimeline(asset)].reverse().find((entry) => entry.status === "Allocated" || /allocat/i.test(entry.note || ""));

const buildAllocation = (asset) => {
  const allocationEvent = getAllocationEvent(asset);

  return {
    id: `alc-${asset.id}`,
    assetId: asset.id,
    assetName: asset.name,
    assetTag: asset.tag,
    employeeId: asset.assignedToId || null,
    employeeName: asset.assignedTo || asset.department || "Unassigned",
    department: asset.department || "",
    allocatedDate: toIsoDate(allocationEvent?.date || asset.registeredDate),
    expectedReturn: toIsoDate(asset.warrantyExpiry),
    returnedDate: null,
    allocatedBy: allocationEvent?.by || "System",
    status: "Active",
    notes: "Derived from current asset assignment",
  };
};

const getActiveAllocations = async () => {
  const assets = await dashboardRepository.findAssetsForDashboard();
  return assets
    .filter((asset) => asset.status === "Allocated")
    .map(buildAllocation);
};

const allocationService = {
  async getAllocations({ page = 1, pageSize = 10, status, department, search } = {}) {
    let allocations = await getActiveAllocations();

    if (status) {
      allocations = allocations.filter((allocation) => allocation.status === status);
    }

    if (department) {
      allocations = allocations.filter((allocation) => allocation.department === department);
    }

    if (search) {
      const needle = search.toLowerCase();
      allocations = allocations.filter((allocation) =>
        [allocation.assetName, allocation.assetTag, allocation.employeeName, allocation.department]
          .some((value) => (value || "").toLowerCase().includes(needle))
      );
    }

    const total = allocations.length;
    const start = (page - 1) * pageSize;
    return {
      data: allocations.slice(start, start + pageSize),
      total,
      page,
      pageSize,
    };
  },

  async getAllocationById(id) {
    const allocations = await getActiveAllocations();
    const allocation = allocations.find((item) => item.id === id);

    if (!allocation) {
      const error = new Error("Allocation not found");
      error.statusCode = 404;
      throw error;
    }

    return allocation;
  },

  async getOverdueAllocations() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const allocations = await getActiveAllocations();

    return allocations.filter((allocation) => {
      const expectedReturn = toDate(allocation.expectedReturn);
      return expectedReturn && expectedReturn < today;
    });
  },
};

module.exports = allocationService;
