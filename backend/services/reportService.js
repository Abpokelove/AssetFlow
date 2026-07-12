const dashboardRepository = require("../repositories/dashboardRepository");
const allocationService = require("./allocationService");

const STATUS_COLORS = {
  Available: "#4CAF50",
  Allocated: "#5E244E",
  Reserved: "#FFB300",
  "Under Maintenance": "#E68457",
  Maintenance: "#E68457",
  Retired: "#8D6E63",
  Disposed: "#9E9E9E",
};

const toNumber = (value) => Number(value || 0);

const toDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);

const monthKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const monthLabel = (date) => date.toLocaleString("en-US", { month: "short" });

const addMonths = (date, months) => new Date(date.getFullYear(), date.getMonth() + months, 1);

const countByStatus = (assets, status) => assets.filter((asset) => asset.status === status).length;

const getTimeline = (asset) => (Array.isArray(asset.timeline) ? asset.timeline : []);

const getTimelineEvents = (assets) =>
  assets.flatMap((asset) =>
    getTimeline(asset).map((entry) => ({
      ...entry,
      asset,
      date: toDate(entry.date),
    }))
  ).filter((entry) => entry.date);

const isAuditDue = (asset) => {
  const lastAuditDate = toDate(asset.lastAuditDate);
  if (!lastAuditDate) return true;

  const dueBefore = new Date();
  dueBefore.setFullYear(dueBefore.getFullYear() - 1);
  return lastAuditDate < dueBefore;
};

const reportService = {
  async getSummary() {
    const assets = await dashboardRepository.findAssetsForDashboard();
    const overdueReturns = await allocationService.getOverdueAllocations();

    const activeBookings = countByStatus(assets, "Reserved");
    return {
      totalAssets: assets.length,
      availableAssets: countByStatus(assets, "Available"),
      allocatedAssets: countByStatus(assets, "Allocated"),
      underMaintenance: countByStatus(assets, "Under Maintenance"),
      pendingApprovals: 0,
      overdueReturns: overdueReturns.length,
      activeBookings,
      activebookings: activeBookings,
      upcomingAudits: assets.filter(isAuditDue).length,
      totalPurchaseValue: assets.reduce((sum, asset) => sum + toNumber(asset.purchaseValue), 0),
      totalCurrentValue: assets.reduce((sum, asset) => sum + toNumber(asset.currentValue), 0),
    };
  },

  async getAssetsByStatus() {
    const assets = await dashboardRepository.findAssetsForDashboard();
    const counts = new Map();

    assets.forEach((asset) => {
      counts.set(asset.status, (counts.get(asset.status) || 0) + 1);
    });

    return [...counts.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([name, value]) => ({
        name,
        value,
        color: STATUS_COLORS[name] || "#9E9E9E",
      }));
  },

  async getAssetsByCategory() {
    const assets = await dashboardRepository.findAssetsForDashboard();
    const counts = new Map();

    assets.forEach((asset) => {
      counts.set(asset.category, (counts.get(asset.category) || 0) + 1);
    });

    return [...counts.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([name, value]) => ({ name, value }));
  },

  async getMonthlyActivity(months = 7) {
    const assets = await dashboardRepository.findAssetsForDashboard();
    const boundedMonths = Math.min(Math.max(parseInt(months, 10) || 7, 1), 24);
    const events = getTimelineEvents(assets);
    const latestEventDate = events.reduce((latest, event) => (
      !latest || event.date > latest ? event.date : latest
    ), null);
    const endMonth = startOfMonth(latestEventDate || new Date());
    const buckets = new Map();

    for (let index = boundedMonths - 1; index >= 0; index -= 1) {
      const date = addMonths(endMonth, -index);
      buckets.set(monthKey(date), {
        month: monthLabel(date),
        allocations: 0,
        returns: 0,
        maintenance: 0,
      });
    }

    events.forEach((event) => {
      const key = monthKey(startOfMonth(event.date));
      const bucket = buckets.get(key);
      if (!bucket) return;

      const status = event.status || "";
      const note = event.note || "";
      if (status === "Allocated" || /allocat/i.test(note)) {
        bucket.allocations += 1;
      }
      if (/return/i.test(note)) {
        bucket.returns += 1;
      }
      if (status === "Under Maintenance" || /maintenance|repair/i.test(note)) {
        bucket.maintenance += 1;
      }
    });

    return [...buckets.values()];
  },

  async getDepartmentUtilization() {
    const assets = await dashboardRepository.findAssetsForDashboard();
    const departments = new Map();

    assets.filter((asset) => asset.department).forEach((asset) => {
      if (!departments.has(asset.department)) {
        departments.set(asset.department, { total: 0, used: 0 });
      }
      const bucket = departments.get(asset.department);
      bucket.total += 1;
      if (["Allocated", "Reserved", "Under Maintenance"].includes(asset.status)) {
        bucket.used += 1;
      }
    });

    return [...departments.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([dept, counts]) => ({
        dept,
        utilization: counts.total === 0 ? 0 : Math.round((counts.used / counts.total) * 100),
      }));
  },

  async getDepreciationReport() {
    const assets = await dashboardRepository.findAssetsForDashboard();
    const totalCurrentValue = assets.reduce((sum, asset) => sum + toNumber(asset.currentValue), 0);

    return Array.from({ length: 12 }, (_, index) => ({
      month: monthLabel(new Date(2024, index, 1)),
      value: Math.round(totalCurrentValue * (1 - index * 0.01)),
    }));
  },
};

module.exports = reportService;
