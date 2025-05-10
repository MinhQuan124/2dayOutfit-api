const express = require("express");
const router = express.Router();

const cartAPIController = require("../controllers/cart.api.controller");

router.post("/:userId", cartAPIController.addOrUpdateCartAPI);
router.post("/:userId/item", cartAPIController.deleteCartAPI);
router.get("/:userId", cartAPIController.getCartAPI);

module.exports = router;
