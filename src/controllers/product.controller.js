const qs = require("qs");
const cloudinary = require("cloudinary").v2;

const Product = require("../models/Product.model");

const productController = {
  //[GET] /admin/products
  getAllProduct: async (req, res) => {
    try {
      const products = await Product.find({}).lean();
      res.render("products/index", { products });
    } catch (error) {
      res.status(500).json(err);
    }
  },

  //[GET] /admin/products/detail
  getProductDetail: async (req, res, next) => {
    try {
      const product = await Product.findOne({ slug: req.params.slug }).lean();
      res.render("products/detail", { product });
    } catch (err) {
      res.status(500).json(err);
    }
  },

  //[GET] /admin/products/create
  createProduct: (req, res) => {
    res.render("products/create");
  },

  //[POST] /admin/products/store
  storeProduct: async (req, res) => {
    try {
      const { name, description, price, brand, category, variations } =
        req.body;

      console.log("BODY:", JSON.stringify(req.body, null, 2));
      console.log("FILES:", req.files);

      const finalVariations = [];

      const variationEntries = Object.entries(variations);

      variationEntries.forEach(([index, variation]) => {
        const imageFile = req.files.find(
          (file) => file.fieldname === `variationImages[${index}]`
        );
        const imageUrl = imageFile?.path || "";

        const sizes = Object.values(variation.sizes || {}).map((size) => ({
          size: size.size,
          quantity: Number(size.quantity),
        }));

        finalVariations.push({
          color: variation.color,
          image: imageUrl,
          sizes,
        });
      });

      const product = new Product({
        name,
        description,
        price,
        brand,
        category: category.toLowerCase(),
        variations: finalVariations,
      });

      await product.save();
      res.redirect("/admin/products");
    } catch (err) {
      console.log(
        "Full Error:",
        JSON.stringify(err, Object.getOwnPropertyNames(err), 2)
      );

      res.status(500).json({ err });
    }
  },

  //[GET] product edit form
  getProductEditForm: async (req, res) => {
    try {
      const product = await Product.findById(req.params.id).lean();
      res.render("products/edit", { product });
    } catch (error) {
      res.status(500).json(err);
    }
  },

  //[PUT] /admin/products/:id
  updateProduct: async (req, res) => {
    try {
      const { id } = req.params;
      const parsedBody = qs.parse(req.body);
      const { name, description, price, brand, category, variations } =
        parsedBody;

      const product = await Product.findById(id);
      if (!product) return res.status(404).send("Product not found");

      const files = req.files || [];
      const removeImages = req.body.removeImages || [];

      const imagesToRemove = Array.isArray(removeImages)
        ? removeImages
        : [removeImages];
      const updatedVariations = [];
      const variationEntries = Object.entries(variations || {});

      variationEntries.forEach(([index, variation], i) => {
        let image = product.variations[index]?.image || "";

        if (imagesToRemove.includes(image)) {
          // Xoá ảnh trên Cloudinary
          const publicId = image.split("/").pop().split(".")[0];
          cloudinary.uploader.destroy(`products/${publicId}`);

          // Thay bằng ảnh mới nếu có
          const newFile = files[i];
          image = newFile?.path || newFile?.secure_url || "";
        }

        const sizes = Object.values(variation.sizes || {}).map((s) => ({
          size: s.size,
          quantity: Number(s.quantity),
        }));

        updatedVariations.push({
          color: variation.color,
          image,
          sizes,
        });
      });

      // Cập nhật
      product.name = name;
      product.description = description;
      product.price = price;
      product.brand = brand;
      product.category = category;
      product.variations = updatedVariations;

      await product.save();
      res.redirect("/admin/products");
    } catch (err) {
      console.error(err);
      res.status(500).json(err);
    }
  },

  //[DELETE] /admin/products/:id
  deleteProduct: async (req, res) => {
    try {
      await Product.delete({ _id: req.params.id });
      res.redirect("/admin/products");
    } catch (err) {
      res.status(500).json(err);
    }
  },

  //[DELETE] /admin/products/:id/destroy
  destroyProduct: async (req, res) => {
    try {
      // Tìm sản phẩm để lấy danh sách ảnh
      const product = await Product.findOneWithDeleted({ _id: req.params.id });

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Xóa ảnh từ Cloudinary
      const imgUrls = product.variations.map((v) => v.image).filter(Boolean);
      for (const imgUrl of imgUrls) {
        const publicId = getPublicIdFromUrl(imgUrl);
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        }
      }

      // Xóa vĩnh viễn khỏi database
      await Product.deleteOne({ _id: req.params.id });

      res.redirect("/admin/products/recyclebin");
    } catch (error) {
      res.status(500).json(error);
    }
  },

  //[GET] /admin/products/recyclebin
  getRecycleProduct: async (req, res) => {
    try {
      const deletedProducts = await Product.findWithDeleted({
        deleted: true,
      }).lean();
      res.render("products/recycleProducts", { deletedProducts });
    } catch (error) {
      res.status(500).json(error);
    }
  },

  //[PATCH] /admin/products/:id/restore
  restoreProduct: async (req, res) => {
    try {
      await Product.restore({ _id: req.params.id });
      res.redirect("/admin/products/recyclebin");
    } catch (error) {
      res.status(500).json(error);
    }
  },
};

function getPublicIdFromUrl(url) {
  if (!url) return null;
  const parts = url.split("/");
  const filename = parts.pop(); // abcxyz.jpg
  const publicId = filename.split(".")[0]; // abcxyz
  return publicId;
}

module.exports = productController;
