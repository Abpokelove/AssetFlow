const express = require("express");
const categoryController = require("../controllers/categoryController");
const { authMiddleware } = require("../auth");

const router = express.Router();

router.get("/", authMiddleware, categoryController.getCategories);
router.post("/", authMiddleware, categoryController.createCategory);

module.exports = router;
