import cloudinary from "./cloudinary.js";

export const deleteCloudinaryImages = async (images = []) => {
  for (const img of images) {
    if (img.public_id) {
      await cloudinary.uploader.destroy(img.public_id);
    }
  }
};
