const express = require("express");
const employeeController = require("../controllers/employeeController");
const { authMiddleware, requireRoles, requireSelfOrRoles } = require("../auth");

const router = express.Router();

router.get("/", authMiddleware, requireRoles("ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"), employeeController.getEmployees);
router.get("/:id", authMiddleware, requireSelfOrRoles("id", "ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"), employeeController.getEmployeeById);
router.post("/", authMiddleware, requireRoles("ADMIN", "ASSET_MANAGER"), employeeController.createEmployee);
module.exports = router;
