const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload.middleware");

const productAPIController = require("../controllers/product.api.controller");

router.get("/search", productAPIController.getSearchedProducts);
router.get("/category/:category", productAPIController.getProductsByCategory);
router.get("/filtered", productAPIController.getFilteredProducts);
router.get("/:slug", productAPIController.getProductDetailAPI);
router.get("/", productAPIController.getAllProductAPI);

module.exports = router;
