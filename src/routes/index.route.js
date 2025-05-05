const Product = require("../models/Product.model");
const productRoutes = require("./product.route");
const productAPIRoutes = require("./product.api.route");

const authMiddleware = require("../middlewares/auth.middleware");

const authRoutes = require("./auth.route");

function route(app) {
  //Home
  app.get("/", (req, res, next) => {
    Product.find({})
      .lean()
      .then((products) => {
        // Với mỗi sản phẩm, tính tổng số lượng
        products.forEach((product) => {
          let total = 0;
          if (product.variations) {
            product.variations.forEach((variation) => {
              if (variation.sizes) {
                variation.sizes.forEach((size) => {
                  total += size.quantity || 0;
                });
              }
            });
          }
          product.totalQuantity = total; // gán vào từng sản phẩm
        });

        res.render("home", {
          products,
        });
      })
      .catch(next);
  });

  //Product API
  app.use("/api/v1/products", productAPIRoutes);

  //Product Admin
  app.use("/admin/products", authMiddleware, productRoutes);

  //Auth admin
  app.use("/admin/auth", authRoutes);
}

module.exports = route;
