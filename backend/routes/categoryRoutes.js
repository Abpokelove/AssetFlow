const express = require("express");
const categoryController = require("../controllers/categoryController");
const { authMiddleware, requireRoles } = require("../auth");

const router = express.Router();

router.get("/", authMiddleware, categoryController.getCategories);
router.post("/", authMiddleware, requireRoles("ADMIN", "ASSET_MANAGER"), categoryController.createCategory);

module.exports = router;
