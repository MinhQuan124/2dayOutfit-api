const Product = require("../models/Product.model");
const productRoutes = require("./product.route");
const authAdminRoutes = require("./authAdmin.route");
const userRoutes = require("./user.route");
const orderRoutes = require("./order.route");

const authMiddleware = require("../middlewares/auth.middleware");

const productAPIRoutes = require("./product.api.route");
const authAPIRoutes = require("./auth.api.route");
const cartAPIRoutes = require("./cart.api.route");
const orderAPIRoutes = require("./order.api.route");

function route(app) {
  //Product API
  app.use("/api/v1/products", productAPIRoutes);
  //Auth api
  app.use("/api/v1/auth", authAPIRoutes);
  //Cart api
  app.use("/api/v1/cart", cartAPIRoutes);
  //Order APi
  app.use("/api/v1/order", orderAPIRoutes);

  //Product Admin
  app.use("/admin/products", authMiddleware, productRoutes);
  //Auth admin
  app.use("/admin/auth", authAdminRoutes);
  //User admin
  app.use("/admin/users", authMiddleware, userRoutes);
  //Order admin
  app.use("/admin/orders", orderRoutes);

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
}

module.exports = route;
