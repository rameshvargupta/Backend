
import express from "express";
import {
  addBannerImages,
  updateSingleImage,
  getCarousel,
  deleteBannerImage,
  getActiveBanners,
} from "../controllers/bannerController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import upload from "../middleware/multer.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  upload.array("images", 5),
  addBannerImages
);


router.put(
  "/:bannerId/image/:imageId",
  authMiddleware,
  upload.single("image"),
  updateSingleImage
);

router.delete(
  "/:bannerId/image/:imageId",
  authMiddleware,
  deleteBannerImage
);

router.get("/active", getActiveBanners);   // full object
router.get("/carousel", getCarousel);      // only images

export default router;
