const express    = require("express");
const router     = express.Router();
const controller = require("../controllers/uploadController");
const protect    = require("../middleware/protect");
const requireRole = require("../middleware/requireRole");
const { upload } = require("../config/cloudinary");

router.post(
  "/images",
  protect,
  requireRole("agent", "agency_admin"),
  upload.array("images", 10),
  controller.uploadImages
);

router.delete(
  "/images/:publicId",
  protect,
  requireRole("agent", "agency_admin"),
  controller.deleteImage
);

module.exports = router;
