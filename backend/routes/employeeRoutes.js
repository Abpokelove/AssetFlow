const express = require("express");
const employeeController = require("../controllers/employeeController");
const { authMiddleware } = require("../auth");

const router = express.Router();

router.get("/", authMiddleware, employeeController.getEmployees);
router.get("/:id", authMiddleware, employeeController.getEmployeeById);
router.post("/", authMiddleware, employeeController.createEmployee);

module.exports = router;
