const express = require("express");
const allocationController = require("../controllers/allocationController");
const { authMiddleware } = require("../auth");

const router = express.Router();

router.get("/", authMiddleware, allocationController.getAllocations);
router.get("/overdue", authMiddleware, allocationController.getOverdueAllocations);
router.get("/:id", authMiddleware, allocationController.getAllocationById);

module.exports = router;
