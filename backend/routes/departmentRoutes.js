const express = require("express");
const departmentController = require("../controllers/departmentController");
const { authMiddleware } = require("../auth");

const router = express.Router();

router.get("/", authMiddleware, departmentController.getDepartments);
router.post("/", authMiddleware, departmentController.createDepartment);

module.exports = router;
