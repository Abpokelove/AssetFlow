const notificationService = require("../services/notificationService");

const notificationController = {
  async getNotifications(req, res, next) {
    try {
      const { page, pageSize, type, read } = req.query;
      const result = await notificationService.getNotifications({
        page: page ? parseInt(page, 10) : 1,
        pageSize: pageSize ? parseInt(pageSize, 10) : 10,
        type,
        read,
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async getUnreadCount(req, res, next) {
    try {
      res.status(200).json(await notificationService.getUnreadCount());
    } catch (error) {
      next(error);
    }
  },

  async markAsRead(req, res, next) {
    try {
      res.status(200).json(await notificationService.markAsRead(req.params.id));
    } catch (error) {
      next(error);
    }
  },

  async markAllAsRead(req, res, next) {
    try {
      res.status(200).json(await notificationService.markAllAsRead());
    } catch (error) {
      next(error);
    }
  },

  async deleteNotification(req, res, next) {
    try {
      await notificationService.deleteNotification(req.params.id);
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = notificationController;
