import multer from "multer";

const storage = multer.memoryStorage();

export const uploadBanner = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});
