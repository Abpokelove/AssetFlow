const express = require("express");
const notificationController = require("../controllers/notificationController");
const { authMiddleware } = require("../auth");

const router = express.Router();

router.get("/", authMiddleware, notificationController.getNotifications);
router.get("/unread-count", authMiddleware, notificationController.getUnreadCount);
router.post("/read-all", authMiddleware, notificationController.markAllAsRead);
router.post("/:id/read", authMiddleware, notificationController.markAsRead);
router.delete("/:id", authMiddleware, notificationController.deleteNotification);

module.exports = router;
