const express = require("express");
const allocationController = require("../controllers/allocationController");
const { authMiddleware, requireRoles } = require("../auth");

const router = express.Router();
const manageAllocations = requireRoles("ADMIN", "ASSET_MANAGER");

router.get("/", authMiddleware, allocationController.getAllocations);
router.get("/overdue", authMiddleware, allocationController.getOverdueAllocations);
router.get("/conflicts", authMiddleware, allocationController.checkConflicts);
router.post("/", authMiddleware, manageAllocations, allocationController.allocateAsset);
router.get("/:id", authMiddleware, allocationController.getAllocationById);
router.post("/:id/transfer", authMiddleware, manageAllocations, allocationController.transferAsset);
router.post("/:id/return", authMiddleware, manageAllocations, allocationController.returnAsset);

module.exports = router;
