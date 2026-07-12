const express = require("express");
const assetController = require("../controllers/assetController");
const { authMiddleware, requireRoles } = require("../auth");

const router = express.Router();

router.get("/", authMiddleware, assetController.getAssets);
router.get("/:id", authMiddleware, assetController.getAssetById);
router.post("/", authMiddleware, requireRoles("ADMIN", "ASSET_MANAGER"), assetController.createAsset);

module.exports = router;
