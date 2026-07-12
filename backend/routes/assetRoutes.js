const express = require("express");
const assetController = require("../controllers/assetController");
const { authMiddleware } = require("../auth");

const router = express.Router();

router.get("/", authMiddleware, assetController.getAssets);
router.get("/:id", authMiddleware, assetController.getAssetById);
router.post("/", authMiddleware, assetController.createAsset);

module.exports = router;
