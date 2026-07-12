const express = require("express");
const departmentController = require("../controllers/departmentController");
const { authMiddleware, requireRoles } = require("../auth");

const router = express.Router();

router.get("/", authMiddleware, departmentController.getDepartments);
router.post("/", authMiddleware, requireRoles("ADMIN", "ASSET_MANAGER"), departmentController.createDepartment);

module.exports = router;
