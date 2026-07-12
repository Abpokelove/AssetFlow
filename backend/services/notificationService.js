const dashboardRepository = require("../repositories/dashboardRepository");

const readNotificationIds = new Set();
const deletedNotificationIds = new Set();

const toDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const daysBetween = (start, end) => Math.ceil((end - start) / (1000 * 60 * 60 * 24));

const buildAssetNotifications = (assets) => {
  const now = new Date();
  const notifications = [];

  assets.forEach((asset) => {
    const warrantyExpiry = toDate(asset.warrantyExpiry);

    if (asset.status === "Under Maintenance") {
      notifications.push({
        id: `ntf-maint-${asset.id}`,
        type: "maintenance",
        title: "Asset Under Maintenance",
        message: `${asset.name} (${asset.tag}) is currently under maintenance.`,
        timestamp: asset.registeredDate || now.toISOString(),
        read: false,
        priority: "High",
        link: "/maintenance",
      });
    }

    if (asset.status === "Allocated" && warrantyExpiry) {
      const daysUntilReturn = daysBetween(now, warrantyExpiry);
      if (daysUntilReturn <= 30) {
        notifications.push({
          id: `ntf-return-${asset.id}`,
          type: "return",
          title: daysUntilReturn < 0 ? "Asset Return Overdue" : "Asset Return Reminder",
          message: `${asset.name} (${asset.tag}) allocated to ${asset.assignedTo || "an assignee"} ${daysUntilReturn < 0 ? "is overdue" : "is due soon"}.`,
          timestamp: warrantyExpiry.toISOString(),
          read: false,
          priority: daysUntilReturn < 0 ? "High" : "Medium",
          link: "/allocation",
        });
      }
    }

    if (asset.status === "Reserved") {
      notifications.push({
        id: `ntf-booking-${asset.id}`,
        type: "booking",
        title: "Asset Reserved",
        message: `${asset.name} (${asset.tag}) is reserved.`,
        timestamp: asset.registeredDate || now.toISOString(),
        read: false,
        priority: "Low",
        link: "/bookings",
      });
    }
  });

  return notifications;
};

const getAllNotifications = async () => {
  const assets = await dashboardRepository.findAssetsForDashboard();

  return buildAssetNotifications(assets)
    .filter((notification) => !deletedNotificationIds.has(notification.id))
    .map((notification) => ({
      ...notification,
      read: readNotificationIds.has(notification.id) || notification.read,
    }))
    .sort((left, right) => new Date(right.timestamp) - new Date(left.timestamp));
};

const parseReadFilter = (value) => {
  if (value === undefined) return null;
  if (value === true || value === "true") return true;
  if (value === false || value === "false") return false;
  return null;
};

const notificationService = {
  async getNotifications({ page = 1, pageSize = 10, type, read, priority, search } = {}) {
    const readFilter = parseReadFilter(read);
    const allNotifications = await getAllNotifications();
    let notifications = allNotifications;

    if (type) {
      notifications = notifications.filter((notification) => notification.type === type);
    }

    if (readFilter !== null) {
      notifications = notifications.filter((notification) => notification.read === readFilter);
    }

    if (priority) {
      notifications = notifications.filter((notification) => notification.priority === priority);
    }

    if (search) {
      const needle = search.toLowerCase();
      notifications = notifications.filter((notification) =>
        [notification.title, notification.message, notification.type, notification.priority]
          .some((value) => (value || "").toLowerCase().includes(needle))
      );
    }

    const total = notifications.length;
    const start = (page - 1) * pageSize;

    return {
      data: notifications.slice(start, start + pageSize),
      total,
      unreadCount: allNotifications.filter((notification) => !notification.read).length,
      page,
      pageSize,
    };
  },

  async getUnreadCount() {
    const notifications = await getAllNotifications();
    return { count: notifications.filter((notification) => !notification.read).length };
  },

  async markAsRead(id) {
    const notifications = await getAllNotifications();
    const notification = notifications.find((item) => item.id === id);

    if (!notification) {
      const error = new Error("Notification not found");
      error.statusCode = 404;
      throw error;
    }

    readNotificationIds.add(id);
    return { ...notification, read: true };
  },

  async markAllAsRead() {
    const notifications = await getAllNotifications();
    notifications.forEach((notification) => readNotificationIds.add(notification.id));
    return { updated: notifications.filter((notification) => !notification.read).length };
  },

  async deleteNotification(id) {
    const notifications = await getAllNotifications();
    const notification = notifications.find((item) => item.id === id);

    if (!notification) {
      const error = new Error("Notification not found");
      error.statusCode = 404;
      throw error;
    }

    deletedNotificationIds.add(id);
  },
};

module.exports = notificationService;
