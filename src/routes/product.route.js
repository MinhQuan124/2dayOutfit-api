const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload.middleware");

const productController = require("../controllers/product.controller");

router.get("/create", productController.createProduct);
router.post("/store", upload.any(), productController.storeProduct);
router.get("/:id/edit", productController.getProductEditForm);
router.put("/:id", upload.any(), productController.updateProduct);
router.patch("/:id/restore", productController.restoreProduct);
router.delete("/:id", productController.deleteProduct);
router.delete("/:id/destroy", productController.destroyProduct);
router.get("/recyclebin", productController.getRecycleProduct);
router.get("/:slug", productController.getProductDetail);
router.get("/", productController.getAllProduct);

module.exports = router;
