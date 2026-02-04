// controllers/bannerController.js
import Banner from "../models/bannerModel.js";
import cloudinary from "../utils/cloudinary.js";

export const addBannerImages = async (req, res) => {
    const { position } = req.body;
    const files = req.files;

    if (!files || !files.length)
        return res.status(400).json({ message: "Images required" });

    let banner = await Banner.findOne({ position });

    if (!banner) {
        banner = await Banner.create({ position, images: [] });
    }

    if (banner.images.length + files.length > 5) {
        return res.status(400).json({ message: "Max 5 images allowed" });
    }

    for (const file of files) {
        const uploaded = await cloudinary.uploader.upload(file.path, {
            folder: `ecart/banners/${position}`,
        });

        banner.images.push({
            imageUrl: uploaded.secure_url,
            imageId: uploaded.public_id,
        });
    }

    await banner.save();
    res.json(banner);
};

/* ================= UPDATE BANNER ================= */
export const updateSingleImage = async (req, res) => {
    const { bannerId, imageId } = req.params;

    const banner = await Banner.findById(bannerId);
    if (!banner) return res.status(404).json({ message: "Banner not found" });

    const imgIndex = banner.images.findIndex(img => img._id == imageId);
    if (imgIndex === -1)
        return res.status(404).json({ message: "Image not found" });

    // delete old
    await cloudinary.uploader.destroy(banner.images[imgIndex].imageId);

    // upload new
    const uploaded = await cloudinary.uploader.upload(req.file.path, {
        folder: "ecart/banners",
    });

    banner.images[imgIndex] = {
        imageUrl: uploaded.secure_url,
        imageId: uploaded.public_id,
    };

    await banner.save();
    res.json(banner);
};

// DELETE single banner image
export const deleteBannerImage = async (req, res) => {
  const { bannerId, imageId } = req.params;

  const banner = await Banner.findById(bannerId);
  if (!banner) return res.status(404).json({ message: "Banner not found" });

  const image = banner.images.find(img => img._id == imageId);
  if (!image) return res.status(404).json({ message: "Image not found" });

  // delete from cloudinary
  await cloudinary.uploader.destroy(image.imageId);

  // remove from array
  banner.images = banner.images.filter(img => img._id != imageId);

  await banner.save();

  res.json({ message: "Image deleted successfully", banner });
};


/* ================= GET ACTIVE BANNERS ================= */
export const getActiveBanners = async (req, res) => {
  const { position } = req.query;

  const banner = await Banner.findOne({ position });

  res.json(banner); // ✅ FULL OBJECT
};



export const getCarousel = async (req, res) => {
  const { position } = req.query;
  const banner = await Banner.findOne({ position });
  res.json(banner?.images || []);
};
