const express = require("express");
const router = express.Router();

const orderAPIController = require("../controllers/order.api.controller");

router.post("/create", orderAPIController.createOrderAPI);
router.put("/cancel/:orderId", orderAPIController.cancelOrderAPI);
router.get("/:userId", orderAPIController.getOrderAPI);

module.exports = router;
