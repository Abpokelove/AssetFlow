const express = require("express");
const reportController = require("../controllers/reportController");
const { authMiddleware } = require("../auth");

const router = express.Router();

router.get("/summary", authMiddleware, reportController.getSummary);
router.get("/assets-by-category", authMiddleware, reportController.getAssetsByCategory);
router.get("/assets-by-status", authMiddleware, reportController.getAssetsByStatus);
router.get("/monthly-activity", authMiddleware, reportController.getMonthlyActivity);
router.get("/department-utilization", authMiddleware, reportController.getDepartmentUtilization);
router.get("/depreciation", authMiddleware, reportController.getDepreciationReport);

module.exports = router;
