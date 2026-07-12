const express = require("express");
const assetController = require("../controllers/assetController");
const { authMiddleware, requireRoles } = require("../auth");

const router = express.Router();

router.get("/", authMiddleware, assetController.getAssets);
router.post("/", authMiddleware, requireRoles("ADMIN", "ASSET_MANAGER"), assetController.createAsset);
router.get("/:id", authMiddleware, assetController.getAssetById);
router.get("/:id/timeline", authMiddleware, assetController.getAssetTimeline);
router.put("/:id", authMiddleware, requireRoles("ADMIN", "ASSET_MANAGER"), assetController.updateAsset);
router.patch("/:id/status", authMiddleware, requireRoles("ADMIN", "ASSET_MANAGER"), assetController.updateAssetStatus);
router.post("/:id/retire", authMiddleware, requireRoles("ADMIN", "ASSET_MANAGER"), assetController.retireAsset);
router.post("/:id/dispose", authMiddleware, requireRoles("ADMIN", "ASSET_MANAGER"), assetController.disposeAsset);
router.delete("/:id", authMiddleware, requireRoles("ADMIN", "ASSET_MANAGER"), assetController.deleteAsset);

module.exports = router;
