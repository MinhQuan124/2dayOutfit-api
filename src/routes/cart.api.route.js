const express = require("express");
const router = express.Router();

const cartAPIController = require("../controllers/cart.api.controller");

router.get("/:userId", cartAPIController.getCartAPI);

module.exports = router;
