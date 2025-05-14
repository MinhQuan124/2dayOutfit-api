const express = require("express");
const router = express.Router();

const cartAPIController = require("../controllers/cart.api.controller");

router.post("/:userId", cartAPIController.addCartAPI);
router.patch("/:userId", cartAPIController.updateCartItemQuantity);
router.patch("/mark-ordered/:userId", cartAPIController.markItemsAsOrdered);
router.post("/:userId/item", cartAPIController.deleteCartAPI);
router.get("/:userId", cartAPIController.getCartAPI);

module.exports = router;
