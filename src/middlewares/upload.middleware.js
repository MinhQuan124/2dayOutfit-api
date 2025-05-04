const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../utils/cloudinary"); // đã là v2 rồi!

const storage = new CloudinaryStorage({
  cloudinary: cloudinary, // ✅ cloudinary v2
  params: {
    folder: "products",
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });
module.exports = upload;
